import asyncio
import json
import logging
import os
import redis.asyncio as redis
from aiogram import Bot
from sqlalchemy import select
from apps.bot.database import AsyncSessionLocal
from packages.database.models import TelegramUser, UserRole
from apps.bot.integrations.amocrm import amocrm

logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}"

async def get_managers_ids():
    async with AsyncSessionLocal() as session:
        # Fetch admins and managers
        stmt = select(TelegramUser.tg_id).where(
            TelegramUser.role.in_([UserRole.director, UserRole.engineer])
        )
        result = await session.execute(stmt)
        return result.scalars().all()

async def start_redis_listener(bot: Bot):
    logger.info("📡 Redis Listener Started...")
    try:
        client = redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
        pubsub = client.pubsub()
        await pubsub.subscribe("notifications")
        logger.info("✅ Subscribed to 'notifications' channel")

        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    event_type = data.get("type")
                    payload = data.get("data", {})

                    if event_type == "new_lead":
                        source = payload.get('source', 'site')
                        
                        if source == "cart_order":
                            items = payload.get('meta', {}).get('items', [])
                            total = payload.get('meta', {}).get('total', 0)
                            items_text = "\n".join([f"- {i['name']} (x{i['quantity']})" for i in items])
                            
                            text = (
                                f"🛒 *Новый Заказ!*\n\n"
                                f"👤 *Клиент:* {payload.get('name', 'Не указано')}\n"
                                f"📞 *Тел:* {payload.get('phone', 'Не указан')}\n"
                                f"🧾 *Товары:*\n{items_text}\n\n"
                                f"💰 *Итого:* {total:,.0f} ₽"
                            )
                        elif source == "diagnostics_widget":
                            analysis = payload.get('meta', {}).get('analysis_result', {})
                            risk_level = analysis.get('risk_level', 'Unknown')
                            probability = analysis.get('probability', '??')
                            recommendation = analysis.get('recommendation', 'Требуется осмотр')
                            
                            risk_icons = {
                                "Low": "🟢",
                                "Moderate": "🟡",
                                "High": "🟠",
                                "Critical": "🔴",
                                "Unknown": "⚪"
                            }
                            icon = risk_icons.get(risk_level, "⚪")
                            
                            text = (
                                f"🔬 *Результат Экспресс-Диагностики*\n\n"
                                f"👤 *Клиент:* {payload.get('name', 'Не указано')}\n"
                                f"📞 *Контакт:* {payload.get('phone', 'Не указан')}\n"
                                f"⚙️ *Тип:* {payload.get('meta', {}).get('type', 'н/д')}\n"
                                f"📅 *Возраст:* {payload.get('meta', {}).get('age', 'н/д')} лет\n\n"
                                f"📊 *Анализ ИИ:*\n"
                                f"{icon} Уровень риска: *{risk_level}*\n"
                                f"📉 Вероятность отказа: *{probability}%*\n\n"
                                f"💡 *Рекомендация:*\n{recommendation}\n\n"
                                f"🔗 Источник: Виджет диагностики"
                            )
                        else:
                            text = (
                                f"🔔 *Новая заявка!*\n\n"
                                f"👤 *Имя:* {payload.get('name', 'Не указано')}\n"
                                f"📞 *Тел:* {payload.get('phone', 'Не указан')}\n"
                                f"📧 *Email:* {payload.get('email', '-')}\n"
                                f"💬 *Сообщение:* {payload.get('message', '-')}\n"
                                f"🔗 *Источник:* {source}"
                            )
                        
                        manager_ids = await get_managers_ids()
                        # Fallback for now if no managers found (or role mismatch)
                        if not manager_ids:
                           # Try env var
                           admin_id = os.getenv("TELEGRAM_ADMIN_CHAT_ID")
                           if admin_id:
                                manager_ids = [int(admin_id)]

                        if not manager_ids:
                            logger.warning("No managers found to notify.")
                        
                        for tg_id in manager_ids:
                            try:
                                await bot.send_message(chat_id=tg_id, text=text, parse_mode="Markdown")
                                logger.info(f"Notification sent to {tg_id}")
                            except Exception as send_err:
                                logger.error(f"Failed to send to {tg_id}: {send_err}")
                    
                    elif event_type == "maintenance_reminder":
                        tg_id = payload.get("tg_id")
                        sn = payload.get("serial_number")
                        date = payload.get("date")
                        name = payload.get("machine_name", "Оборудование")
                        
                        text = (
                            f"🗓 *Напоминание о ТО!*\n\n"
                            f"⚙️ *Станок:* {name} (`{sn}`)\n"
                            f"🕒 *Плановое ТО:* {date}\n\n"
                            f"💡 До планового обслуживания осталось *30 дней*. "
                            f"Рекомендуем заранее проверить наличие необходимых расходных материалов."
                        )
                        
                        if tg_id:
                            try:
                                await bot.send_message(chat_id=int(tg_id), text=text, parse_mode="Markdown")
                                logger.info(f"Maintenance reminder sent to {tg_id}")
                            except Exception as send_err:
                                logger.error(f"Failed to send reminder to {tg_id}: {send_err}")
                        
                        # Phase 3: Create AmoCRM Lead for Sales followup
                        client_name = payload.get("client_name", "Клиент")
                        lead_name = f"ТО: {name} ({sn}) - {client_name}"
                        await amocrm.create_lead(
                            name=lead_name,
                            price=0,
                            tags=["Сервис", "ТО", "Maintenance Upsell"]
                        )
                                
                except json.JSONDecodeError:
                    logger.error("Failed to decode Redis message")
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    
    except asyncio.CancelledError:
        logger.info("Redis Listener Task Cancelled.")
        if 'pubsub' in locals():
            await pubsub.close()
    except Exception as e:
        logger.error(f"Redis Listener Error: {e}")
        await asyncio.sleep(5)
        # Restarting listener is handled by main loop or supervisor in a robust system
        # For now, we log and exit the task (or recursively call?)
        # Let's simple create a loop inside if connection fails
