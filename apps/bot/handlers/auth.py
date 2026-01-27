import logging
import aiohttp
from aiogram import Router, F, types
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from .common import BACKEND_URL, get_user_role, register_user_role

logger = logging.getLogger(__name__)
router = Router()

class Registration(StatesGroup):
    waiting_for_consent = State()
    choosing_role = State()

@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext, http_session: aiohttp.ClientSession):
    """Entry point for the bot."""
    args = message.text.split()
    if len(args) > 1 and args[1].startswith("machine_"):
        serial_number = args[1].replace("machine_", "")
        from .engineer import show_machine_status
        await show_machine_status(message, serial_number, state, http_session)
        return

    role = await get_user_role(message.from_user.id)
    if role:
        from .common import send_role_menu
        await send_role_menu(message, role)
        return

    # If first time, show consent
    from apps.bot.keyboards import consent_kb
    await message.answer(
        "👋 Добро пожаловать в Цифровую Экосистему РУССТАНКО!\n\n"
        "Для продолжения работы необходимо согласие на обработку персональных данных (152-ФЗ).",
        reply_markup=consent_kb
    )
    await state.set_state(Registration.waiting_for_consent)

@router.callback_query(Registration.waiting_for_consent, F.data == "consent_accept")
async def process_consent(callback: CallbackQuery, state: FSMContext):
    """User agreed to terms, ask for role."""
    from apps.bot.keyboards import role_selection_kb
    await callback.message.edit_text(
        "Отлично! Теперь выберите вашу роль, чтобы мы настроили интерфейс под ваши задачи:",
        reply_markup=role_selection_kb
    )
    await state.set_state(Registration.choosing_role)

@router.callback_query(Registration.choosing_role, F.data.startswith("role_"))
async def process_role_selection(callback: CallbackQuery, state: FSMContext):
    """User selected a role, register and show menu."""
    role_key = callback.data.replace("role_", "")
    success = await register_user_role(callback.from_user.id, role_key)
    
    if success:
        await state.clear()
        from .common import send_role_menu
        await send_role_menu(callback.message, role_key)
    else:
        await callback.message.answer("❌ Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.")
    
    await callback.answer()

@router.message(Command("login"))
async def cmd_login(message: Message):
    """Show login info."""
    await message.answer("Для входа в личный кабинет на сайте используйте ваш номер телефона.")
