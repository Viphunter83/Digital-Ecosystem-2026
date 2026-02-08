from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from apps.backend.app.core.database import get_db
from packages.database.models import Lead, LeadSource
from pydantic import BaseModel, EmailStr, field_validator
import re
import os
import logging
from typing import Optional, Dict, Any

router = APIRouter()
logger = logging.getLogger(__name__)

class LeadCreate(BaseModel):
    source: str # bot, site
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    message: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        # Basic international format check: +7 or 8 followed by digits, spaces, dashes
        clean_phone = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^(\+7|7|8)\d{10}$", clean_phone):
            raise ValueError("Некорректный формат номера телефона. Используйте +7 (999) 123-45-67")
        return clean_phone

from apps.backend.app.services.notification import notification_service

async def sync_task(lead_id: str):
    """Background task to sync lead with AmoCRM."""
    from apps.backend.app.integrations.amocrm import amocrm_client
    from apps.backend.app.core.database import SessionLocal
    from packages.database.models import Lead
    import os

    logger.info(f"Background task: Started sync_task for lead_id: {lead_id}")
    
    background_db = SessionLocal()
    try:
        # Refresh lead from DB to avoid DetachedInstanceError
        lead = background_db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            logger.error(f"Background task failed: Lead {lead_id} not found in database")
            return

        logger.info(f"Syncing lead {lead_id} from {lead.source.value}...")
        
        # Find/Create contact first
        contact = await amocrm_client.find_contact_by_phone(lead.phone)
        if not contact:
            logger.info(f"Creating new contact for lead {lead_id}...")
            contact = await amocrm_client.create_contact(
                name=lead.name or "Новый клиент",
                phone=lead.phone,
                email=lead.email
            )
        
        # Extract price if available (e.g. from cart total)
        price = 0
        if lead.metadata_ and "total" in lead.metadata_:
            try:
                price = int(float(lead.metadata_["total"]))
            except (ValueError, TypeError):
                price = 0
        
        # Prepare custom fields mapping
        c_fields = {}
        serial_id = os.getenv("AMOCRM_FIELD_SERIAL_ID")
        tg_id = os.getenv("AMOCRM_FIELD_TELEGRAM_ID")
        model_id = os.getenv("AMOCRM_FIELD_MODEL_ID")

        if serial_id and lead.metadata_ and "serial_number" in lead.metadata_:
            c_fields[serial_id] = lead.metadata_["serial_number"]
        
        if tg_id and lead.metadata_ and "tg_user_id" in lead.metadata_:
            c_fields[tg_id] = str(lead.metadata_["tg_user_id"])
        
        if model_id:
            if lead.source.value == "cart_order":
                c_fields[model_id] = "Запчасти (Корзина)"
            elif lead.metadata_ and "machine_type" in lead.metadata_:
                c_fields[model_id] = lead.metadata_["machine_type"]
        
        # Create Lead
        source_labels = {
            "site": "Сайт (Обратная связь)",
            "bot": "Telegram Бот",
            "cart_order": "Заказ запчастей",
            "diagnostics_widget": "Диагностика",
            "diagnostics": "Сервисная заявка"
        }
        label = source_labels.get(lead.source.value, lead.source.value)
        
        logger.info(f"Sending lead to AmoCRM: {label} - {lead.name}")
        amo_lead = await amocrm_client.create_lead(
            name=f"{label}: {lead.name or 'Без имени'}",
            price=price,
            contact_id=contact.get("id") if contact else None,
            custom_fields=c_fields
        )
        
        if amo_lead:
            amo_lead_id = int(amo_lead.get("id"))
            logger.info(f"Successfully created AmoCRM lead {amo_lead_id} for local lead {lead_id}")
            # Update local lead with Amo ID
            lead.amocrm_id = str(amo_lead_id)
            background_db.commit()

            # --- Add detailed notes to AmoCRM lead ---
            try:
                # 1. Universal User Message Note
                if lead.message:
                    await amocrm_client.add_note("leads", amo_lead_id, f"💬 СООБЩЕНИЕ ПОЛЬЗОВАТЕЛЯ:\n{lead.message}")
                
                # 2. Cart Items Note
                if lead.source.value == "cart_order" and lead.metadata_ and "items" in lead.metadata_:
                    items = lead.metadata_["items"]
                    note_text = "🛒 СОСТАВ ЗАКАЗА (ЗАПЧАСТИ):\n"
                    for item in items:
                        note_text += f"- {item.get('name')} (x{item.get('quantity')}) — {item.get('price', 0):,.0f} ₽\n"
                    note_text += f"\nИТОГО: {lead.metadata_.get('total', 0):,.0f} ₽"
                    await amocrm_client.add_note("leads", amo_lead_id, note_text)
                
                # 3. Diagnostics Result Note
                if lead.source.value == "diagnostics_widget" and lead.metadata_ and "analysis_result" in lead.metadata_:
                    res = lead.metadata_["analysis_result"]
                    note_text = "🔬 РЕЗУЛЬТАТ ДИАГНОСТИКИ:\n"
                    note_text += f"Уровень риска: {res.get('risk_level')}\n"
                    note_text += f"Вероятность отказа: {res.get('probability')}%\n"
                    note_text += f"Рекомендация: {res.get('recommendation')}\n"
                    
                    if "issues" in lead.metadata_:
                        note_text += f"\nВыявленные проблемы: {', '.join(lead.metadata_['issues'])}"
                    
                    await amocrm_client.add_note("leads", amo_lead_id, note_text)
                    
            except Exception as note_err:
                logger.error(f"Failed to add AmoCRM notes for {amo_lead_id}: {note_err}")
    except Exception as e:
        logger.error(f"Background sync error for lead {lead_id}: {e}")
    finally:
        background_db.close()

@router.post("/")
async def create_lead(lead_in: LeadCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Ingest a new lead from any source (Site/Bot).
    """
    try:
        new_lead = Lead(
            source=LeadSource(lead_in.source),
            name=lead_in.name,
            phone=lead_in.phone,
            email=lead_in.email,
            message=lead_in.message,
            metadata_=lead_in.meta,
            status="new"
        )
        
        # Async DB Execution
        from fastapi.concurrency import run_in_threadpool
        
        def save_lead():
            db.add(new_lead)
            db.commit()
            db.refresh(new_lead)
            
        await run_in_threadpool(save_lead)
        
        # --- Notification Logic ---
        try:
            await notification_service.notify_new_lead({
                "id": str(new_lead.id),
                "name": new_lead.name,
                "phone": new_lead.phone,
                "email": new_lead.email,
                "message": new_lead.message,
                "source": new_lead.source.value,
                "meta": new_lead.metadata_
            })
        except Exception as notify_err:
            logger.error(f"Failed to send notification: {notify_err}")
        # --------------------------

        # --- AmoCRM Sync ---
        try:
            background_tasks.add_task(sync_task, str(new_lead.id))
        except Exception as amo_err:
            logger.error(f"AmoCRM sync trigger failed: {amo_err}")
        
        return {"status": "ok", "lead_id": str(new_lead.id)}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid source")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-crm")
async def test_crm_connection():
    """Manual trigger to test AmoCRM connection."""
    from apps.backend.app.integrations.amocrm import amocrm_client
    try:
        lead = await amocrm_client.create_lead(
            name="TEST: Система отладки v3",
            price=1,
            custom_fields={}
        )
        if lead:
            return {"status": "success", "amo_lead_id": lead.get("id")}
        return {"status": "failed", "message": "AmoCRM returned empty response"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
