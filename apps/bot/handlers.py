import logging
import aiohttp
import os
from aiogram import Router, F, types
from aiogram.filters import CommandStart
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.bot.keyboards import (
    role_selection_kb, 
    engineer_kb, 
    procurement_kb, 
    director_kb,
    invoice_method_kb
)
from apps.bot.database import AsyncSessionLocal
from packages.database.models import TelegramUser, UserRole, ClientEquipment, ServiceTicket, Product

# Constants
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000")

# Router setup
router = Router()
logger = logging.getLogger(__name__)

class Registration(StatesGroup):
    choosing_role = State()

class InvoiceStates(StatesGroup):
    waiting_for_file = State()

async def get_user_role(tg_id: int) -> str | None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(TelegramUser).where(TelegramUser.tg_id == tg_id))
        user = result.scalar_one_or_none()
        if user and user.role:
            return user.role.value if hasattr(user.role, 'value') else user.role
        return None

async def register_user_role(tg_id: int, role_key: str):
    # role_key e.g 'engineer', 'director' matching UserRole enum
    async with AsyncSessionLocal() as session:
        # Check if exists
        result = await session.execute(select(TelegramUser).where(TelegramUser.tg_id == tg_id))
        user = result.scalar_one_or_none()
        
        if not user:
            user = TelegramUser(tg_id=tg_id)
            session.add(user)
        
        # Update Role
        # Ensure role_key matches Enum value
        role_enum = UserRole[role_key]
        user.role = role_enum
        
        await session.commit()

@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    user_id = message.from_user.id
    
    # Check if user exists in DB
    existing_role = await get_user_role(user_id)
    
    if existing_role:
        await send_role_menu(message, existing_role)
    else:
        # Start onboarding
        await message.answer(
            "👋 Вас приветствует Цифровой Ассистент «РусСтанкоСбыт».\n\n"
            "Для настройки интерфейса, выберите вашу роль:",
            reply_markup=role_selection_kb
        )
        await state.set_state(Registration.choosing_role)

from aiogram.filters import Command

@router.message(Command("login"))
async def cmd_login(message: Message):
    args = message.text.split()
    if len(args) != 2:
        await message.answer("Использование: /login <password>")
        return
    
    password = args[1]
    # In a real app, hash checking or env var. MVP: hardcoded.
    if password == "admin2026": 
        await register_user_role(message.from_user.id, "manager")
        await message.answer("✅ Вы авторизованы как Менеджер. Вы будете получать уведомления о заявках.")
    else:
        await message.answer("❌ Неверный пароль.")

# --- Role Selection Callback ---
@router.callback_query(F.data.startswith("role_"))
async def process_role_selection(callback: CallbackQuery, state: FSMContext):
    role_code = callback.data.split("_")[1] # engineer, procurement, director
    user_id = callback.from_user.id
    
    # Save to DB
    try:
        await register_user_role(user_id, role_code)
    except Exception as e:
        logger.error(f"Failed to save user role: {e}")
        await callback.answer("Ошибка сохранения данных.", show_alert=True)
        return
    
    await callback.message.delete()
    await callback.message.answer(f"✅ Роль установлена: *{role_code.upper()}*")
    
    # Send appropriate menu
    await send_role_menu(callback.message, role_code)
    
    await state.clear()
    await callback.answer()

async def send_role_menu(message: Message, role: str):
    if role == "engineer":
        await message.answer("Режим: 🛠 Техническое обслуживание", reply_markup=engineer_kb)
    elif role == "procurement":
        await message.answer("Режим: 💼 Закупки и логистика", reply_markup=procurement_kb)
    elif role == "director":
        await message.answer("Режим: 👔 Управление активами", reply_markup=director_kb)

# --- Procurement Handlers ---

@router.message(F.text == "📄 Запросить Счёт/КП")
async def procurement_invoice(message: Message):
    await message.answer(
        "Как вы хотите передать заявку?",
        reply_markup=invoice_method_kb
    )

@router.callback_query(F.data == "invoice_photo")
async def invoice_photo_handler(callback: CallbackQuery, state: FSMContext):
    await callback.message.edit_text("📸 Пожалуйста, отправьте фото шильдика станка или списка запчастей.")
    await state.set_state(InvoiceStates.waiting_for_file)
    await callback.answer()

@router.callback_query(F.data == "invoice_excel")
async def invoice_excel_handler(callback: CallbackQuery, state: FSMContext):
    await callback.message.edit_text("📎 Ожидаю файл (.xlsx, .pdf). Я автоматически распознаю номенклатуру.")
    await state.set_state(InvoiceStates.waiting_for_file)
    await callback.answer()

@router.message(InvoiceStates.waiting_for_file, F.content_type.in_({types.ContentType.PHOTO, types.ContentType.DOCUMENT}))
async def handle_invoice_upload(message: Message, state: FSMContext):
    # Determine file type
    file_id = None
    file_name = "unknown"
    
    if message.photo:
        file_id = message.photo[-1].file_id
        file_name = "photo.jpg"
    elif message.document:
        file_id = message.document.file_id
        file_name = message.document.file_name
        
    # Send Lead to Backend
    try:
        user_info = {
            "name": message.from_user.full_name,
            "username": message.from_user.username
        }
        
        async with aiohttp.ClientSession() as session:
            payload = {
                "source": "bot",
                "name": user_info['name'],
                "message": f"Запрос счета (Файл: {file_name}). Username: @{user_info.get('username', 'N/A')}",
                "meta": {"telegram_file_id": file_id}
            }
            # Fire and forget (or await response)
            async with session.post(f"{BACKEND_URL}/ingest/leads", json=payload) as resp:
                if resp.status == 200:
                    logger.info(f"Lead created for {message.from_user.id}")
                else:
                    err = await resp.text()
                    logger.error(f"Failed to create lead: {err}")
    except Exception as e:
        logger.error(f"Error sending lead: {e}")

    await message.answer(
        f"✅ *Заявка зарегистрирована!*\n"
        f"Файл `{file_name}` передан менеджеру.\n\n"
        "Ваш персональный менеджер проверит наличие и свяжется с вами в течение 15 минут."
    )
    # Reset state so user can continue using menu
    await state.clear()

@router.message(F.text == "🚚 Где мой груз?")
async def procurement_cargo(message: Message):
    await message.answer(
        "Введите номер заказа или накладной для отслеживания (интеграция СДЭК/Деловые Линии)."
    )

@router.message(F.text == "📦 Каталог Запчастей")
async def procurement_catalog(message: Message):
    # Fallback if user's client doesn't support WebApp (unlikely nowadays)
    await message.answer(
        "Нажмите кнопку ниже, чтобы открыть каталог.",
        reply_markup=procurement_kb
    )

@router.message(F.content_type == types.ContentType.WEB_APP_DATA)
async def web_app_data_handler(message: Message):
    import json
    raw_data = message.web_app_data.data
    
    try:
        data = json.loads(raw_data)
    except json.JSONDecodeError:
        # Fallback for simple string data
        await message.answer(f"🛒 *Заявка получена*\n\nДанные: `{raw_data}`\n\nМенеджер свяжется для подтверждения.")
        return

    if isinstance(data, dict) and data.get("type") == "ORDER":
        # Handle Cart Order
        items = data.get("items", [])
        total = data.get("total", 0)
        
        # Build Receipt String
        receipt_text = "🛒 *Новый Заказ*\n\n"
        for item in items:
            receipt_text += f"▪️ {item['name']} x{item['quantity']} — {item['price']*item['quantity']:,} ₽\n"
        
        receipt_text += f"\n💰 *ИТОГО: {total:,} ₽*"
        receipt_text += "\n\n📂 Заказ передан в отдел продаж. Ожидайте звонка."
        
        await message.answer(receipt_text)
        
        # Send to Backend as Lead
        try:
            user_info = {
                "name": message.from_user.full_name,
                "username": message.from_user.username
            }
            
            async with aiohttp.ClientSession() as session:
                payload = {
                    "source": "bot_order",
                    "name": user_info['name'],
                    "message": f"Заказ из WebApp:\n{raw_data}\nUsername: @{user_info.get('username', 'N/A')}",
                    "meta": {
                        "telegram_user_id": message.from_user.id,
                        "order_data": data
                    }
                }
                
                async with session.post(f"{BACKEND_URL}/ingest/leads", json=payload) as resp:
                    if resp.status == 200:
                        logger.info(f"Order Lead created for {message.from_user.id}")
                    else:
                        err = await resp.text()
                        logger.error(f"Failed to create order lead: {err}")
        except Exception as e:
            logger.error(f"Error sending order to backend: {e}")
            
    else:
        # Generic handler
        await message.answer(f"✅ *Данные получены*\n\n`{raw_data}`")


# --- Engineer Handlers ---

@router.message(F.text == "🏭 Мой Парк")
async def engineer_machines(message: Message):
    async with AsyncSessionLocal() as session:
        # For demo: fetch all equipment (in prod: where(client_id=user.client_id))
        stmt = select(ClientEquipment).join(Product)
        result = await session.execute(stmt)
        equipment_list = result.scalars().all()
        
        if not equipment_list:
             await message.answer("Список оборудования пуст.")
             return

        response = "🏭 *Ваше Оборудование:*\n\n"
        for eq in equipment_list:
             # Need to fetch product lazy load or use joined load option
             # Quick fix: refresh or explicit join query
             # Since we joined, we can access if options set, but lazy load works in async usually if session open? No, async requires eager.
             # Let's perform a specific query or assume seed data.
             # Better: fetch product name
             prod_res = await session.execute(select(Product).where(Product.id == eq.product_id))
             prod = prod_res.scalar_one()
             
             status_icon = "🟢"
             if eq.next_maintenance_date and (str(eq.next_maintenance_date) < "2026-02-01"):
                 status_icon = "🟡 (Скоро ТО)"
             
             response += (
                 f"**{prod.name}**\n"
                 f"🆔 SN: `{eq.serial_number}`\n"
                 f"⏱ Наработка: {eq.usage_hours} ч\n"
                 f"🗓 След. ТО: {eq.next_maintenance_date.strftime('%d.%m.%Y') if eq.next_maintenance_date else 'Н/Д'}\n"
                 f"Статус: {status_icon}\n\n"
             )
        await message.answer(response)

@router.message(F.text == "🛠 Вызвать Сервис")
async def engineer_sos(message: Message):
    # Create Real Ticket
    async with AsyncSessionLocal() as session:
        # Get first equipment for demo
        stmt = select(ClientEquipment).limit(1)
        res = await session.execute(stmt)
        eq = res.scalar_one_or_none()
        
        if not eq:
             await message.answer("⚠️ Нет зарегистрированного оборудования.")
             return

        # Check existing user
        user_res = await session.execute(select(TelegramUser).where(TelegramUser.tg_id == message.from_user.id))
        user = user_res.scalar_one_or_none()
        
        import uuid
        ticket_id = f"REQ-{uuid.uuid4().hex[:4].upper()}"
        
        ticket = ServiceTicket(
            ticket_number=ticket_id,
            equipment_id=eq.id,
            author_id=user.id if user else None, # Might fail integrity if user not registered properly
            description="Заявка из Телеграм Бота (SOS)",
            status="new",
            priority="critical"
        )
        session.add(ticket)
        await session.commit()

    await message.answer(
        f"🆘 *Заявка #{ticket_id} зарегистрирована.*\n\n"
        "Дежурный инженер уведомлен. Ожидайте звонка в течение 10 минут.\n"
        "Статус заявки можно отследить в разделе «Статус Ремонта»."
    )

@router.message(F.text == "🔧 Статус Ремонта")
async def engineer_status(message: Message):
    async with AsyncSessionLocal() as session:
        stmt = select(ServiceTicket).limit(5).order_by(ServiceTicket.created_at.desc())
        result = await session.execute(stmt)
        tickets = result.scalars().all()
        
        if not tickets:
            await message.answer("📭 Активных заявок нет.")
            return

        resp = "🛠 *Текущие Заявки:*\n\n"
        for t in tickets:
            icon = "🔴" if t.priority == 'critical' else "🟡"
            if t.status == 'resolved': icon = "🟢"
            
            resp += (
                f"{icon} **#{t.ticket_number}** ({t.status})\n"
                f"📝 {t.description}\n\n"
            )
        await message.answer(resp)

@router.message(F.text == "📚 База Знаний")
async def engineer_knowledge(message: Message):
    # Link to FAQ and Docs
    await message.answer(
        "📚 *База Знаний РусСтанкоСбыт*\n\n"
        "Доступные разделы:\n"
        "1. [Инструкции по эксплуатации](https://russtankosbyt.ru/docs)\n"
        "2. [Часто задаваемые вопросы (FAQ)](https://russtankosbyt.ru#faq)\n"
        "3. [Каталог ошибок ЧПУ](https://russtankosbyt.ru/errors)\n\n"
        "🔍 *Совет:* Вы также можете спросить меня: *«Как сбросить ошибку 204?»* (функция в разработке)."
    )

# --- Director Handlers ---

@router.message(F.text == "📊 Сводка Расходов")
async def director_stats(message: Message):
    await message.answer(
        "📊 *Финансовая Сводка (2025)*\n\n"
        "Всего потрачено на ТО: 1.2 млн ₽\n"
        "Капитальные ремонты: 4.5 млн ₽\n"
        "Закупка запчастей: 350 тыс ₽\n\n"
        "📈 Экономия за счет планово-предупредительного ремонта: ~15%"
    )
    
@router.message(F.text == "🏆 Активные Проекты")
async def director_projects(message: Message):
    await message.answer(
        "🏭 *Модернизация Цеха №2*\n"
        "Статус: 🟡 В работе\n"
        "Бюджет: 12.5 млн ₽\n"
        "Срок сдачи: Март 2026"
    )

@router.message(F.text == "💎 Персональное Предложение")
async def director_offer(message: Message):
    await message.answer(
        "💎 *Спецпредложение для вашей компании:*\n\n"
        "При заключении договора на сервисное обслуживание до *01.02.2026*:\n"
        "✅ **Скидка 15%** на запчасти в течение года\n"
        "✅ **Бесплатный** ежеквартальный аудит оборудования\n\n"
        "Скачать КП: [offer_2026_premium.pdf](https://russtankosbyt.ru/promo/premium)"
    )

# --- Universal Handlers ---
@router.message(F.text.contains("Менеджер"))
async def call_manager(message: Message):
    await message.answer("📞 Ваш менеджер Алексей: +7 (999) 000-00-00")
