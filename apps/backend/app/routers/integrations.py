from fastapi import APIRouter, Request, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select
from apps.backend.app.core.database import get_db
from packages.database.models import Client, MachineInstance, Product, TelegramUser, Notification, Lead
import logging
import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock Pydantic model for documentation
from pydantic import BaseModel

class AmoLeadPayload(BaseModel):
    lead_id: str
    status: str
    pipeline_id: str
    custom_fields: dict # {serial_number: "...", product_slug: "..."}
    contact: dict # {phone: "+7...", name: "..."}

@router.post("/amocrm/webhook")
async def handle_amocrm_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint receives Webhook from AmoCRM.
    Handles 'leads[status][0][status_id]' change to 'Success' (142 or configured).
    """
    # 0. Verify Secret if configured
    import os
    secret = os.getenv("AMOCRM_WEBHOOK_SECRET")
    if secret:
        # AmoCRM can send secret in query params or we can check a custom header if configured
        # For simplicity, we check if it's passed as a query param 'secret'
        provided_secret = request.query_params.get("secret")
        if provided_secret != secret:
             logger.warning(f"Unauthorized AmoCRM webhook attempt from {request.client.host}")
             raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        # AmoCRM sends data as x-www-form-urlencoded
        form_data = await request.form()
        data_dict = dict(form_data)
        logger.info(f"Received AmoCRM Webhook Form Data: {data_dict}")
        
        # 1. Check for Lead Status Change
        # Amo payload structure: leads[status][0][id], leads[status][0][status_id], etc.
        lead_id = data_dict.get("leads[status][0][id]")
        status_id = data_dict.get("leads[status][0][status_id]")
        
        if not status_id:
            logger.warning("AmoCRM webhook received without status_id")
            return {"status": "ignored", "reason": "no_status_found"}

        # 2. Extract Custom Fields and Contact Info
        serial_number = None
        client_phone = None
        
        # Heuristic parsing for nested AmoCRM form data
        for key, value in data_dict.items():
            key_lower = key.lower()
            # Look for serial number in custom fields
            if "custom_fields" in key_lower and ("serial" in key_lower or "серийный" in key_lower):
                serial_number = value
            # Look for phone in contacts
            if "contacts" in key_lower and "phone" in key_lower:
                client_phone = value
        
        # 3. Process 'Success' status (142 is default 'Closed/Won')
        if status_id == "142":
            logger.info(f"Deal {lead_id} marked as SUCCESS. Serial: {serial_number}")
            
            # Find Lead in our DB if exists (for additional context)
            lead = db.execute(select(Lead).where(Lead.amocrm_id == str(lead_id))).scalar_one_or_none()
            
            # Use data from lead if webhook is missing it
            serial_number = serial_number or (lead.metadata_.get("serial_number") if lead and lead.metadata_ else None)
            
            if not serial_number:
                logger.error(f"Cannot register equipment for lead {lead_id}: serial_number missing")
                return {"status": "error", "reason": "serial_number_missing"}

            # Find Client by phone if we have it
            client = None
            if client_phone:
                # Basic normalization of phone could be added here
                # Search in TelegramUser first as they are most likely 'clients' in TMA context
                tg_user = db.execute(select(TelegramUser).where(TelegramUser.phone == client_phone)).scalar_one_or_none()
                if tg_user and tg_user.client_id:
                    client = db.execute(select(Client).where(Client.id == tg_user.client_id)).scalar_one_or_none()

            # Find/Create Machine Instance
            existing_instance = db.execute(select(MachineInstance).where(MachineInstance.serial_number == serial_number)).scalar_one_or_none()
            
            if not existing_instance:
                new_instance = MachineInstance(
                    serial_number=serial_number,
                    client_id=client.id if client else None,
                    status='operational',
                    manufacturing_date=datetime.datetime.now()
                )
                db.add(new_instance)
                db.commit()
                logger.info(f"Registered new equipment: {serial_number} for client {client.name if client else 'Unknown'}")
                return {"status": "ok", "action": "equipment_registered", "serial": serial_number}
            else:
                # Update existing instance if client was just found
                if client and not existing_instance.client_id:
                    existing_instance.client_id = client.id
                    db.commit()
                    logger.info(f"Associated existing equipment {serial_number} with client {client.name}")
            
            return {"status": "ok", "action": "already_exists_or_updated"}

        return {"status": "ok", "action": "processed"}

    except Exception as e:
        logger.error(f"Error processing AmoCRM webhook: {e}", exc_info=True)
        return {"status": "error", "details": str(e)}
