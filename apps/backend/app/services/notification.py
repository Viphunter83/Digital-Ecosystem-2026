import redis.asyncio as redis
import json
import logging
from apps.backend.app.core.config import settings

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self.channel = "notifications"

    async def notify_new_lead(self, lead_data: dict):
        """
        Publishes a new lead event to Redis.
        """
        await self.publish_event("new_lead", lead_data)

    async def publish_event(self, event_type: str, data: dict):
        """
        Generic event publisher.
        """
        try:
            client = redis.from_url(self.redis_url, encoding="utf-8", decode_responses=True)
            message = {
                "type": event_type,
                "data": data
            }
            await client.publish(self.channel, json.dumps(message))
            logger.info(f"Published {event_type} event to {self.channel}")
            await client.close()
        except Exception as e:
            logger.error(f"Failed to publish {event_type} notification: {e}")

notification_service = NotificationService()
