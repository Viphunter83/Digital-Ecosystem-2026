from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from apps.backend.app.core.database import get_db
from packages.database.models import Lead, LeadSource
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

router = APIRouter()

class LeadCreate(BaseModel):
    source: str # bot, site
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    message: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

import os
import requests
import logging

# ... imports ...

logger = logging.getLogger(__name__)

TELEGRAM_ADMIN_CHAT_ID = os.getenv("TELEGRAM_ADMIN_CHAT_ID", "45053735")
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
                
                # Create Lead
                amo_lead = await amocrm_client.create_lead(
                    name=f"Заявка: {new_lead.source.value} ({new_lead.name})",
                    price=price,
                    contact_id=contact.get("id") if contact else None,
                    custom_fields={
                        # Map your internal lead ID or other metadata
                        # "FIELD_ID": str(new_lead.id)
                    }
                )
                
                if amo_lead:
                    # Update local lead with Amo ID
                    new_lead.amocrm_id = str(amo_lead.get("id"))
                    db.add(new_lead)
                    db.commit()
            
            background_tasks.add_task(sync_task)
        except Exception as amo_err:
            logger.error(f"AmoCRM sync trigger failed: {amo_err}")
        
        return {"status": "ok", "lead_id": str(new_lead.id)}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid source")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
