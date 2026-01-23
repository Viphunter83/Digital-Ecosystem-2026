from fastapi import APIRouter, Request, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select
from apps.backend.app.core.database import get_db
from packages.database.models import Client, ClientEquipment, Product, TelegramUser, Notification
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
    try:
        # AmoCRM sends data as x-www-form-urlencoded
        form_data = await request.form()
        data_dict = dict(form_data)
        logger.info(f"Received AmoCRM Webhook Form Data: {data_dict}")
        
        # 1. Check for Lead Status Change
        # Amo payload structure for leads: leads[status][0][id], leads[status][0][status_id], etc.
        lead_id = data_dict.get("leads[status][0][id]")
        status_id = data_dict.get("leads[status][0][status_id]")
        pipeline_id = data_dict.get("leads[status][0][pipeline_id]")
        
        # We only care about specific pipelines or statuses (e.g., 142 is often 'Closed/Won')
        # In a real app, status_id would be compared against a config value
        if not status_id:
            return {"status": "ignored", "reason": "no_status_found"}

        # 2. Extract Custom Fields
        # Custom fields look like: leads[status][0][custom_fields][0][id] = FIELD_ID
        # and leads[status][0][custom_fields][0][values][0][value] = VALUE
        
        serial_number = None
        product_slug = None
        client_inn = None
        
        # We need to iterate through form keys to find custom fields
        # Note: In production, we'd use a more refined parser for these nested keys
        for key, value in data_dict.items():
            if "custom_fields" in key:
                if "serial" in key.lower() or "серийный" in key.lower(): # Just a heuristic for the demo
                    serial_number = value
                # In real life, we would use FIELD_IDs from settings
        
        # 3. Process 'Success' status
        # Assuming '142' is the won status
        if status_id == "142":
            logger.info(f"Deal {lead_id} marked as SUCCESS. Syncing equipment...")
            
            # Find Lead in our DB if exists
            lead = db.execute(select(Lead).where(Lead.amocrm_id == lead_id)).scalar_one_or_none()
            
            # Use data from lead or webhook
            serial_number = serial_number or (lead.metadata_.get("serial_number") if lead and lead.metadata_ else None)
            product_slug = product_slug or (lead.metadata_.get("product_slug") if lead and lead.metadata_ else None)
            
            if not serial_number:
                return {"status": "error", "reason": "serial_number_missing"}

            # Find Product
            product = None
            if product_slug:
                product = db.execute(select(Product).where(Product.slug == product_slug)).scalar_one_or_none()

            # Find/Create Machine Instance
            existing_instance = db.execute(select(MachineInstance).where(MachineInstance.serial_number == serial_number)).scalar_one_or_none()
            
            if not existing_instance:
                new_instance = MachineInstance(
                    serial_number=serial_number,
                    product_id=product.id if product else None,
                    status='operational',
                    manufacturing_date=datetime.datetime.now()
                )
                db.add(new_instance)
                db.commit()
                logger.info(f"Registered new equipment: {serial_number}")
                return {"status": "ok", "action": "equipment_registered", "serial": serial_number}
            
            return {"status": "ok", "action": "already_exists"}

        return {"status": "ok", "action": "processed"}

    except Exception as e:
        logger.error(f"Error processing AmoCRM webhook: {e}")
        return {"status": "error", "details": str(e)}
