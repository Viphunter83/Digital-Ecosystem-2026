import redis.asyncio as redis
import json
import logging
from apps.backend.app.core.config import settings

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}"
        self.channel = "notifications"

    async def notify_new_lead(self, lead_data: dict):
        """
        Publishes a new lead event to Redis.
        """
        try:
            client = redis.from_url(self.redis_url, encoding="utf-8", decode_responses=True)
            message = {
                "type": "new_lead",
                "data": lead_data
            }
            await client.publish(self.channel, json.dumps(message))
            logger.info(f"Published new_lead event to {self.channel}")
            await client.close()
        except Exception as e:
            logger.error(f"Failed to publish notification: {e}")

notification_service = NotificationService()
