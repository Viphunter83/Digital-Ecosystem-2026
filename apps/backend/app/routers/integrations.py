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
    Endpoint receives Webhook from AmoCRM when Deal Status = 'Success/Sold'.
    """
    try:
        # AmoCRM sends x-www-form-urlencoded by default, but we'll accept JSON for this demo
        # or parse form data if needed. For MVP simplicity, let's assume JSON payload 
        # sent via a custom automation script or modern webhook.
        payload = await request.json()
        logger.info(f"Received AmoCRM Webhook: {payload}")
        
        # 1. Parse Data
        # In real life: map custom_field_ids (e.g. 123456) to 'Serial Number'
        lead_id = payload.get("leads", {}).get("status", [{}])[0].get("id")
        
        # DEMO LOGIC: We extract data assuming a specific simplified structure
        # (This simulates what we'd do after normalizing the complex Amo payload)
        
        # Let's say payload = {"event": "deal_status_changed", "data": {"product_slug": "1m63-cnc", "serial": "AMO-999", "client_inn": "5036040000"}}
        data = payload.get("data", {})
        product_slug = data.get("product_slug")
        serial_number = data.get("serial")
        client_inn = data.get("client_inn")
        
        if not (product_slug and serial_number and client_inn):
             return {"status": "ignored", "reason": "missing_fields"}

        # 2. Find/Create Client & Product
        client = db.execute(select(Client).where(Client.inn == client_inn)).scalar_one_or_none()
        if not client:
             # Auto-create client?
             logger.info(f"Client {client_inn} not found, skipping automation.")
             return {"status": "error", "message": "client_not_found"}

        product = db.execute(select(Product).where(Product.slug == product_slug)).scalar_one_or_none()
        
        # 3. Register Equipment
        new_eq = ClientEquipment(
            client_id=client.id,
            product_id=product.id,
            serial_number=serial_number,
            purchase_date=datetime.datetime.now(),
            warranty_until=datetime.datetime.now() + datetime.timedelta(days=365),
            next_maintenance_date=datetime.datetime.now() + datetime.timedelta(days=180),
            usage_hours=0
        )
        db.add(new_eq)
        
        # 4. Notify Manager/Client (if bound) via Telegram
        # Find TelegramUser linked to this client
        tg_users = db.execute(select(TelegramUser).where(TelegramUser.client_id == client.id)).scalars().all()
        for user in tg_users:
            notif = Notification(
                user_id=user.id,
                message=f"🎉 *Поздравляем с покупкой!*\n\nВаш новый станок **{product.name}** (SN: {serial_number}) успешно зарегистрирован в Цифровой Экосистеме.\nТеперь вы можете отслеживать его статус и заказывать запчасти.",
                status="pending"
            )
            db.add(notif)
            
        db.commit()
        return {"status": "ok", "action": "equipment_registered"}

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return {"status": "error", "details": str(e)}
