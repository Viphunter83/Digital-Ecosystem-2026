import logging
import os
import aiohttp
from aiogram import Router, types
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select
from apps.bot.keyboards import engineer_kb, procurement_kb, director_kb
from apps.bot.database import AsyncSessionLocal
from packages.database.models import TelegramUser, UserRole

# Constants
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000")
DIRECTUS_URL = os.getenv("DIRECTUS_URL", "https://admin.td-rss.ru")

logger = logging.getLogger(__name__)
router = Router()

async def get_user_role(tg_id: int) -> str | None:
    """Fetch user role from database."""
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(select(TelegramUser).where(TelegramUser.tg_id == tg_id))
            user = result.scalar_one_or_none()
            if user and user.role:
                return user.role.value if hasattr(user.role, 'value') else user.role
        except Exception as e:
            logger.error(f"Error fetching user role: {e}")
    return None

async def register_user_role(tg_id: int, role_key: str):
    """Update user role in database."""
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(select(TelegramUser).where(TelegramUser.tg_id == tg_id))
            user = result.scalar_one_or_none()
            
            if not user:
                user = TelegramUser(tg_id=tg_id)
                session.add(user)
            
            role_enum = UserRole[role_key]
            user.role = role_enum
            await session.commit()
            return True
        except Exception as e:
            logger.error(f"Error registering user role: {e}")
            await session.rollback()
    return False

async def send_role_menu(message: Message, role: str):
    """Sends the appropriate menu keyboard based on the user's role."""
    if role == "engineer":
        await message.answer("🛠 *Режим: Техническое обслуживание*", reply_markup=engineer_kb, parse_mode="Markdown")
    elif role == "procurement":
        await message.answer("💼 *Режим: Закупки и логистика*", reply_markup=procurement_kb, parse_mode="Markdown")
    elif role == "director":
        await message.answer("👔 *Режим: Управление активами*", reply_markup=director_kb, parse_mode="Markdown")
    else:
        await message.answer("⚠️ Роль не распознана. Обратитесь к администратору.")

@router.callback_query(lambda c: c.data == "call_manager")
async def handle_call_manager(callback: types.CallbackQuery):
    """Handle 'Call Manager' button click."""
    await callback.message.answer(
        "📞 Менеджер уведомлен. Мы свяжемся с вами в ближайшее время.\n"
        "Либо вы можете позвонить нам: +7 (499) 390-85-04"
    )
    await callback.answer()
