import os
import sys
import json
import logging
from datetime import datetime, timedelta
from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker
import redis

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from apps.backend.app.core.config import settings
from packages.database.models import MachineInstance, TelegramUser, Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scheduler")

# Configuration
DATABASE_URL = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost") # local check
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
redis_client = redis.from_url(REDIS_URL)

def check_maintenance():
    db = SessionLocal()
    try:
        # We look for maintenance due in exactly 30 days (+/- 24h)
        target_date = (datetime.now() + timedelta(days=30)).date()
        logger.info(f"Checking maintenance due on: {target_date}")
        
        # Query instances with matching maintenance date
        stmt = select(MachineInstance).where(
            text(f"CAST(next_maintenance_date AS DATE) = '{target_date}'")
        )
        instances = db.execute(stmt).scalars().all()
        
        for instance in instances:
            logger.info(f"Machine {instance.serial_number} due for maintenance in 30 days")
            
            # Find users to notify (those linked to the client)
            user_stmt = select(TelegramUser).where(TelegramUser.client_id == instance.client_id)
            users = db.execute(user_stmt).scalars().all()
            
            for user in users:
                notification_payload = {
                    "type": "maintenance_reminder",
                    "data": {
                        "tg_id": user.tg_id,
                        "serial_number": instance.serial_number,
                        "date": instance.next_maintenance_date.strftime("%d.%m.%Y"),
                        "machine_name": "Оборудование" # Could join Product to get real name
                    }
                }
                
                # Publish to Redis
                redis_client.publish("notifications", json.dumps(notification_payload))
                logger.info(f"Published reminder for user {user.tg_id} / machine {instance.serial_number}")

    except Exception as e:
        logger.error(f"Scheduler error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_maintenance()
