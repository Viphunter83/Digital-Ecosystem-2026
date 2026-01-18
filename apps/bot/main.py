import asyncio
import logging
import os
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

from apps.bot.handlers import router

# Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not set")
        return

    bot = Bot(token=TELEGRAM_BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.MARKDOWN))
    
    # Storage for FSM
    storage = MemoryStorage()
    dp = Dispatcher(storage=storage)
    
    # Include main router
    dp.include_router(router)
    
    # Start Poller
    from apps.bot.poller import start_notification_poller
    asyncio.create_task(start_notification_poller(bot))
    
    logger.info("Starting Role-Based Bot...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped")
