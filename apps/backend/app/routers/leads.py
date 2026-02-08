from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from apps.backend.app.core.database import get_db
from packages.database.models import Lead, LeadSource
from pydantic import BaseModel, EmailStr, field_validator
import re
from typing import Optional, Dict, Any

router = APIRouter()

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

import os
import requests
import logging

# ... imports ...

logger = logging.getLogger(__name__)

TELEGRAM_ADMIN_CHAT_ID = os.getenv("TELEGRAM_ADMIN_CHAT_ID")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

from apps.backend.app.services.notification import notification_service

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
# ...
@router.post("/leads")
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
            from apps.backend.app.integrations.amocrm import amocrm_client
            
            async def sync_task():
                # Find/Create contact first
                contact = await amocrm_client.find_contact_by_phone(new_lead.phone)
                if not contact:
                    contact = await amocrm_client.create_contact(
                        name=new_lead.name or "Новый клиент",
                        phone=new_lead.phone,
                        email=new_lead.email
                    )
                
                # Extract price if available (e.g. from cart total)
                price = 0
                if new_lead.metadata_ and "total" in new_lead.metadata_:
                    try:
                        price = float(new_lead.metadata_["total"])
                    except (ValueError, TypeError):
                        price = 0
                
                # Prepare custom fields mapping
                c_fields = {}
                serial_id = os.getenv("AMOCRM_FIELD_SERIAL_ID")
                tg_id = os.getenv("AMOCRM_FIELD_TELEGRAM_ID")
                model_id = os.getenv("AMOCRM_FIELD_MODEL_ID")

                if serial_id and new_lead.metadata_ and "serial_number" in new_lead.metadata_:
                    c_fields[serial_id] = new_lead.metadata_["serial_number"]
                
                if tg_id and new_lead.metadata_ and "tg_user_id" in new_lead.metadata_:
                    c_fields[tg_id] = str(new_lead.metadata_["tg_user_id"])
                
                # If it's a cart order, we can set model field to 'Spare Parts'
                if model_id:
                    if new_lead.source.value == "cart_order":
                        c_fields[model_id] = "Запчасти (Корзина)"
                    elif new_lead.metadata_ and "machine_type" in new_lead.metadata_:
                        c_fields[model_id] = new_lead.metadata_["machine_type"]

                # Create Lead
                source_labels = {
                    "site": "Сайт (Обратная связь)",
                    "bot": "Telegram Бот",
                    "cart_order": "Заказ запчастей",
                    "diagnostics_widget": "Диагностика",
                    "diagnostics": "Сервисная заявка"
                }
                label = source_labels.get(new_lead.source.value, new_lead.source.value)
                
                amo_lead = await amocrm_client.create_lead(
                    name=f"{label}: {new_lead.name or 'Без имени'}",
                    price=price,
                    contact_id=contact.get("id") if contact else None,
                    custom_fields=c_fields
                )
                
                if amo_lead:
                    # Update local lead with Amo ID
                    new_lead.amocrm_id = str(amo_lead.get("id"))
                    db.add(new_lead)
                    db.commit()

                    # --- Add detailed notes to AmoCRM lead ---
                    try:
                        amo_lead_id = int(amo_lead.get("id"))
                        
                        # 1. Universal User Message Note
                        if new_lead.message:
                            await amocrm_client.add_note("leads", amo_lead_id, f"💬 СООБЩЕНИЕ ПОЛЬЗОВАТЕЛЯ:\n{new_lead.message}")
                        
                        # 2. Cart Items Note
                        if new_lead.source.value == "cart_order" and new_lead.metadata_ and "items" in new_lead.metadata_:
                            items = new_lead.metadata_["items"]
                            note_text = "🛒 СОСТАВ ЗАКАЗА (ЗАПЧАСТИ):\n"
                            for item in items:
                                note_text += f"- {item.get('name')} (x{item.get('quantity')}) — {item.get('price', 0):,.0f} ₽\n"
                            note_text += f"\nИТОГО: {new_lead.metadata_.get('total', 0):,.0f} ₽"
                            await amocrm_client.add_note("leads", amo_lead_id, note_text)
                        
                        # 3. Diagnostics Result Note
                        if new_lead.source.value == "diagnostics_widget" and new_lead.metadata_ and "analysis_result" in new_lead.metadata_:
                            res = new_lead.metadata_["analysis_result"]
                            note_text = "🔬 РЕЗУЛЬТАТ ДИАГНОСТИКИ:\n"
                            note_text += f"Уровень риска: {res.get('risk_level')}\n"
                            note_text += f"Вероятность отказа: {res.get('probability')}%\n"
                            note_text += f"Рекомендация: {res.get('recommendation')}\n"
                            
                            if "issues" in new_lead.metadata_:
                                note_text += f"\nВыявленные проблемы: {', '.join(new_lead.metadata_['issues'])}"
                            
                            await amocrm_client.add_note("leads", amo_lead_id, note_text)
                            
                    except Exception as note_err:
                        logger.error(f"Failed to add AmoCRM notes: {note_err}")
            
            background_tasks.add_task(sync_task)
        except Exception as amo_err:
            logger.error(f"AmoCRM sync trigger failed: {amo_err}")
        
        return {"status": "ok", "lead_id": str(new_lead.id)}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid source")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
