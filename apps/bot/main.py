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
    
    # Setup Global aiohttp session
    import aiohttp
    timeout = aiohttp.ClientTimeout(total=10) # 10s global timeout
    async with aiohttp.ClientSession(timeout=timeout) as session:
        # Pass session to handlers or context
        dp["http_session"] = session
        
        # Include main router
        dp.include_router(router)
        
        # Start Poller (DB)
        from apps.bot.poller import start_notification_poller
        asyncio.create_task(start_notification_poller(bot))

        # Start Redis Listener
        from apps.bot.redis_listener import start_redis_listener
        asyncio.create_task(start_redis_listener(bot))
        
        logger.info("Starting Role-Based Bot with Global Session...")
        await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped")
