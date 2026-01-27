import logging
import aiohttp
from aiogram import Router, F, types
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from sqlalchemy import select
from packages.database.models import MachineInstance, Product, ClientEquipment, TelegramUser, ServiceTicket
from apps.bot.database import AsyncSessionLocal
import datetime
import uuid

from .common import BACKEND_URL, logger
from apps.bot.keyboards import engineer_kb, get_service_request_kb

router = Router()

@router.message(F.text == "🏭 Мой Парк")
async def engineer_machines(message: Message):
    async with AsyncSessionLocal() as session:
        stmt = select(MachineInstance).limit(15)
        result = await session.execute(stmt)
        instances = result.scalars().all()
        
        if not instances:
             await message.answer("Список оборудования пуст.")
             return

        response = "🏭 *Ваше Оборудование:*\n\n"
        for inst in instances:
             prod_res = await session.execute(select(Product).where(Product.id == inst.product_id))
             prod = prod_res.scalar_one()
             
             status_icons = {
                "operational": "🟢",
                "maintenance": "🟡",
                "repair": "🔴",
                "offline": "⚫"
             }
             icon = status_icons.get(inst.status, "❓")
             
             is_soon = False
             if inst.next_maintenance_date:
                 days_diff = (inst.next_maintenance_date - datetime.datetime.now(datetime.timezone.utc)).days
                 if 0 < days_diff <= 30:
                     is_soon = True

             response += (
                 f"{icon} **{prod.name}**\n"
                 f"🆔 SN: `{inst.serial_number}`\n"
                 f"📊 Статус: {inst.status.upper()}\n"
                 f"🗓 След. ТО: {inst.next_maintenance_date.strftime('%d.%m.%Y') if inst.next_maintenance_date else 'Н/Д'}"
                 f"{' ⚠️ *СКОРО!*' if is_soon else ''}\n\n"
             )
        await message.answer(response, parse_mode="Markdown")

@router.message(F.text == "🛠 Вызвать Сервис")
async def engineer_sos(message: Message):
    async with AsyncSessionLocal() as session:
        stmt = select(ClientEquipment).limit(1)
        res = await session.execute(stmt)
        eq = res.scalar_one_or_none()
        
        if not eq:
             await message.answer("⚠️ Нет зарегистрированного оборудования.")
             return

        user_res = await session.execute(select(TelegramUser).where(TelegramUser.tg_id == message.from_user.id))
        user = user_res.scalar_one_or_none()
        
        ticket_id = f"REQ-{uuid.uuid4().hex[:4].upper()}"
        
        ticket = ServiceTicket(
            ticket_number=ticket_id,
            equipment_id=eq.id,
            author_id=user.id if user else None,
            description="Заявка из Телеграм Бота (SOS)",
            status="new",
            priority="critical"
        )
        session.add(ticket)
        await session.commit()

    await message.answer(
        f"🆘 *Заявка #{ticket_id} зарегистрирована.*\n\n"
        "Дежурный инженер уведомлен. Ожидайте звонка в течение 10 минут.\n"
        "Статус заявки можно отследить в разделе «Статус Ремонта».",
        parse_mode="Markdown"
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
        await message.answer(resp, parse_mode="Markdown")

@router.message(F.text == "📚 База Знаний")
async def engineer_knowledge(message: Message):
    await message.answer(
        "📚 *База Знаний РУССТАНКО*\n\n"
        "Здесь вы найдете инструкции, чертежи и руководства по эксплуатации.\n"
        "В данный момент раздел наполняется.",
        parse_mode="Markdown"
    )

async def show_machine_status(message: Message, serial_number: str, state: FSMContext, http_session: aiohttp.ClientSession):
    """Integrated machine status view (from QR/deep links)."""
    try:
        async with http_session.get(f"{BACKEND_URL}/catalog/instances/{serial_number}") as resp:
            if resp.status == 200:
                data = await resp.json()
                name = data.get("product", {}).get("name", "Оборудование")
                status = data.get("status", "unknown").upper()
                
                keyboard = get_service_request_kb(serial_number)
                
                await message.answer(
                    f"🤖 **Цифровой Двойник: {name}**\n\n"
                    f"🔢 Серийный номер: `{serial_number}`\n"
                    f"📊 Статус: {status}\n\n"
                    "Выберите действие:",
                    reply_markup=keyboard,
                    parse_mode="Markdown"
                )
            else:
                await message.answer("❌ Оборудование с таким серийным номером не найдено.")
    except Exception as e:
        logger.error(f"Error fetching machine status: {e}")
        await message.answer("⚠️ Ошибка при получении данных об оборудовании.")

@router.callback_query(F.data.startswith("request_service_"))
async def handle_service_request(callback: CallbackQuery):
    sn = callback.data.replace("request_service_", "")
    await callback.message.answer(f"✅ Запрос на сервис для станка `{sn}` принят. Инженер свяжется с вами.")
    await callback.answer()

@router.callback_query(F.data.startswith("request_parts_"))
async def handle_parts_request(callback: CallbackQuery):
    sn = callback.data.replace("request_parts_", "")
    await callback.message.answer(f"📦 Запрос на подбор запчастей для `{sn}` принят. Менеджер подготовит КП.")
    await callback.answer()
