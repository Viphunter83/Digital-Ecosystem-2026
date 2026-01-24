import logging
from sqlalchemy import select
from sqlalchemy.orm import Session
from packages.database.models import Client, MachineInstance, Product, TelegramUser
from apps.backend.app.integrations.amocrm import amocrm_client
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# ID статуса "Успешно реализовано" в AmoCRM (обычно 142)
AMO_STATUS_SUCCESS = 142

# Карта ID дополнительных полей в AmoCRM (уточняется в .env или по вебхуку)
# В продакшене лучше вынести в конфиг
AMO_FIELD_SERIAL = "CF_SERIAL" 
AMO_FIELD_MODEL = "CF_MODEL"

class AmoCRMSyncService:
    async def process_webhook(self, data: Dict[str, Any], db: Session):
        """
        Обработка входящего вебхука от AmoCRM.
        Логика: если сделка закрыта как успешная -> создаем MachineInstance.
        """
        leads = data.get("leads", {}).get("status", [])
        if not leads:
            leads = data.get("leads", {}).get("update", [])
            
        for lead in leads:
            lead_id = lead.get("id")
            status_id = int(lead.get("status_id", 0))
            
            if status_id == AMO_STATUS_SUCCESS:
                logger.info(f"Lead {lead_id} closed as success. Triggering machine registration.")
                await self.register_machine_from_lead(lead, db)

    async def register_machine_from_lead(self, lead: Dict[str, Any], db: Session):
        """
        Создание оборудования на основе данных сделки.
        """
        # 1. Получаем полные данные сделки из API
        lead_id = lead.get("id")
        full_lead = await amocrm_client.get_lead(lead_id)
        if not full_lead:
            logger.error(f"Failed to fetch lead {lead_id} from AmoCRM")
            return

        # 2. Извлекаем Custom Fields
        custom_fields = {cf["field_id"]: cf["values"][0]["value"] for cf in full_lead.get("custom_fields_values", [])}
        
        serial_number = custom_fields.get(AMO_FIELD_SERIAL)
        model_slug = custom_fields.get(AMO_FIELD_MODEL) # Предполагаем, что тут slug продукта

        if not serial_number:
            logger.warning(f"Lead {lead_id} has no serial number. Skipping.")
            return

        # 3. Находим продукт в нашей БД
        stmt = select(Product).where(Product.slug == model_slug)
        product = db.execute(stmt).scalar_one_or_none()
        if not product:
            logger.error(f"Product with slug {model_slug} not found for lead {lead_id}")
            return

        # 4. Находим контакт (клиента)
        contact_id = full_lead.get("_embedded", {}).get("contacts", [{}])[0].get("id")
        # Здесь логика поиска нашего Client по contact_id или ИНН из AmoCRM
        # Для упрощения: ищем Client по ID компании в Amo или создаем нового
        
        # 5. Создаем MachineInstance
        new_instance = MachineInstance(
            product_id=product.id,
            serial_number=serial_number,
            status='operational',
            service_history=[] # Пустая история для нового станка
        )
        
        # Проверка на дубликаты
        existing = db.execute(select(MachineInstance).where(MachineInstance.serial_number == serial_number)).scalar_one_or_none()
        if existing:
            logger.info(f"MachineInstance {serial_number} already exists. Skipping.")
            return

        db.add(new_instance)
        try:
            db.commit()
            logger.info(f"Successfully registered machine {serial_number} from AmoCRM lead {lead_id}")
            
            # --- Уведомление клиента ---
            # TODO: Реализовать отправку приветственного сообщения клиенту в TG
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save MachineInstance {serial_number}: {e}")

amocrm_sync_service = AmoCRMSyncService()
