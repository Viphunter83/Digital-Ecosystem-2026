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
        Publishes a new lead event to Redis and sends direct notifications.
        """
        # 1. Pub/Sub for other services
        await self.publish_event("new_lead", lead_data)
        
        # 2. Direct Telegram Notification
        await self.send_telegram_notification(lead_data)
        
        # 3. Direct Email Notification
        await self.send_email_notification(lead_data)

    async def send_telegram_notification(self, lead_data: dict):
        """
        Sends notification to admin via Telegram Bot API.
        """
        if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_ADMIN_CHAT_ID:
            logger.warning("Telegram notification skipped: Missing BOT_TOKEN or ADMIN_CHAT_ID")
            return

        def escape_html(text) -> str:
            if not text: return ""
            return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

        name = escape_html(lead_data.get('name') or 'Не указано')
        phone = escape_html(lead_data.get('phone') or 'Не указан')
        email = escape_html(lead_data.get('email') or 'Не указан')
        source = escape_html(lead_data.get('source'))

        message = (
            f"🚀 <b>НОВЫЙ ЛИД!</b>\n\n"
            f"👤 Имя: {name}\n"
            f"📞 Тел: {phone}\n"
            f"📧 Email: {email}\n"
            f"🔗 Источник: {source}\n"
        )
        
        if lead_data.get('message'):
            message += f"\n💬 Сообщение: {escape_html(lead_data.get('message'))}"

        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": settings.TELEGRAM_ADMIN_CHAT_ID,
            "text": message,
            "parse_mode": "HTML"
        }

        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as resp:
                    if resp.status == 200:
                        logger.info("Telegram notification sent successfully")
                    else:
                        resp_text = await resp.text()
                        logger.error(f"Failed to send Telegram notification: {resp_text}")
        except Exception as e:
            logger.error(f"Telegram notification error: {e}")

    async def send_email_notification(self, lead_data: dict):
        """
        Sends notification to admin via SMTP.
        """
        if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
            logger.warning("Email notification skipped: Missing SMTP configuration")
            return

        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        import smtplib
        from fastapi.concurrency import run_in_threadpool

        subject = f"Новая заявка: {lead_data.get('name') or 'Лид'}"
        body = (
            f"Поступила новая заявка!\n\n"
            f"Имя: {lead_data.get('name')}\n"
            f"Телефон: {lead_data.get('phone')}\n"
            f"Email: {lead_data.get('email')}\n"
            f"Источник: {lead_data.get('source')}\n"
            f"Сообщение: {lead_data.get('message')}\n\n"
        )

        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM
        msg['To'] = settings.NOTIFICATION_RECIPIENT_EMAIL
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        def send_sync():
            try:
                if settings.SMTP_PORT == 465:
                    server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
                else:
                    server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
                    server.starttls()
                
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
                server.quit()
                return True
            except Exception as e:
                logger.error(f"SMTP send error: {e}")
                return False

        success = await run_in_threadpool(send_sync)
        if success:
            logger.info("Email notification sent successfully")

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
