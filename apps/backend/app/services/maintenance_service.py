import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from packages.database.models import MachineInstance, TelegramUser, Notification, Client
from apps.backend.app.services.notification import notification_service

logger = logging.getLogger(__name__)

class MaintenanceService:
    def __init__(self, db: Session):
        self.db = db

    async def check_upcoming_maintenance(self, days_ahead: int = 30):
        """
        Scan for machine instances requiring maintenance in 'days_ahead' days.
        """
        logger.info(f"Checking for maintenance tasks {days_ahead} days ahead...")
        
        target_date = datetime.now() + timedelta(days=days_ahead)
        # We check for the date part to avoid missing matches due to precise time
        # However, for simplicity and 100% match on a daily run, we can use a range or date cast
        
        # SQLAlchemy select with filter for next_maintenance_date
        # Note: Depending on DB timezones, date(target_date) is safer.
        stmt = select(MachineInstance).where(
            func.date(MachineInstance.next_maintenance_date) == target_date.date()
        )
        
        # wait, func might need import from sqlalchemy
        from sqlalchemy import func
        
        result = self.db.execute(stmt)
        instances = result.scalars().all()
        
        logger.info(f"Found {len(instances)} machines for maintenance on {target_date.date()}")
        
        for instance in instances:
            await self._notify_maintenance(instance, days_ahead)

    async def _notify_maintenance(self, instance: MachineInstance, days_ahead: int):
        """
        Create notifications for all users associated with the client.
        """
        if not instance.client_id:
            logger.warning(f"Machine {instance.serial_number} has no client associated.")
            return

        # Find users
        stmt = select(TelegramUser).where(TelegramUser.client_id == instance.client_id)
        result = self.db.execute(stmt)
        users = result.scalars().all()
        
        for user in users:
            message = (
                f"🛠 *Плановое ТО*\n\n"
                f"Напоминаем, что через {days_ahead} дней ({instance.next_maintenance_date.strftime('%d.%m.%Y')}) "
                f"настанет срок планового технического обслуживания для станка с серийным номером *{instance.serial_number}*.\n\n"
                f"Рекомендуем заранее заказать необходимые расходные материалы."
            )
            
            # Create notification in DB
            new_notif = Notification(
                user_id=user.id,
                message=message,
                status='pending'
            )
            self.db.add(new_notif)
            
        self.db.commit()
        logger.info(f"Created maintenance notifications for machine {instance.serial_number}")

# Note: In a real scheduler, we'd pass a session from a session maker
