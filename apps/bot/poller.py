import asyncio
import logging
from aiogram import Bot
from sqlalchemy import select
from apps.bot.database import AsyncSessionLocal
from packages.database.models import Notification, TelegramUser

logger = logging.getLogger(__name__)

async def start_notification_poller(bot: Bot):
    logger.info("📡 Notification Poller Started...")
    while True:
        try:
            async with AsyncSessionLocal() as session:
                # Fetch pending notifications
                # Join with User to get valid tg_id
                stmt = (
                    select(Notification)
                    .join(TelegramUser)
                    .where(Notification.status == 'pending')
                    .limit(10) # batch size
                )
                result = await session.execute(stmt)
                notifications = result.scalars().all()

                for notif in notifications:
                    try:
                        # Fetch user to get tg_id (lazy load might fail in async/await if not managing constraints, but typically select joins are better. status=pending filter implies we have them)
                        # We need to eager load user or join. The query above joins but returns Notification.
                        # Notification.user is relationship. Let's use lazy load or explicit join fetch.
                        # Simplest: await session.refresh(notif, ['user'])
                        
                        # Wait, we need the associated user object
                        user_stmt = select(TelegramUser).where(TelegramUser.id == notif.user_id)
                        user_res = await session.execute(user_stmt)
                        user = user_res.scalar_one_or_none()
                        
                        if user and user.tg_id:
                            await bot.send_message(
                                chat_id=user.tg_id,
                                text=f"🔔 *Уведомление*\n\n{notif.message}"
                            )
                            notif.status = 'sent'
                            logger.info(f"Sent notification {notif.id} to {user.tg_id}")
                        else:
                            logger.warning(f"User not found for notification {notif.id}")
                            notif.status = 'failed'
                            
                    except Exception as e:
                        logger.error(f"Failed to send notification {notif.id}: {e}")
                        notif.status = 'error'
                
                if notifications:
                    await session.commit()

        except Exception as e:
            logger.error(f"Poller Error: {e}")
        
        await asyncio.sleep(10) # Poll every 10 seconds
