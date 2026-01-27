import logging
import aiohttp
import json
from aiogram import Router, F, types
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from .common import BACKEND_URL, logger
from apps.bot.keyboards import invoice_method_kb, procurement_kb

router = Router()

class InvoiceStates(StatesGroup):
    waiting_for_file = State()

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
async def handle_invoice_upload(message: Message, state: FSMContext, http_session: aiohttp.ClientSession):
    file_id = None
    file_name = "unknown"
    
    if message.photo:
        file_id = message.photo[-1].file_id
        file_name = "photo.jpg"
    elif message.document:
        file_id = message.document.file_id
        file_name = message.document.file_name
    
    user_info = {
        "name": message.from_user.full_name,
        "username": message.from_user.username
    }
    
    try:
        payload = {
            "source": "bot_invoice",
            "name": user_info['name'],
            "message": f"Загружен файл: {file_name}\nUsername: @{user_info.get('username', 'N/A')}",
            "meta": {
                "telegram_user_id": message.from_user.id,
                "file_id": file_id
            }
        }
        
        async with http_session.post(f"{BACKEND_URL}/ingest/leads", json=payload) as resp:
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
        "Ваш персональный менеджер проверит наличие и свяжется с вами в течение 15 минут.",
        parse_mode="Markdown"
    )
    await state.clear()

@router.message(F.text == "🚚 Где мой груз?")
async def procurement_cargo(message: Message):
    await message.answer(
        "Введите номер заказа или накладной для отслеживания (интеграция СДЭК/Деловые Линии)."
    )

@router.message(F.text == "📦 Каталог Запчастей")
async def procurement_catalog(message: Message):
    await message.answer(
        "Нажмите кнопку ниже, чтобы открыть каталог.",
        reply_markup=procurement_kb
    )

@router.message(F.text == "📞 Менеджер")
async def call_manager_proc(message: Message):
    await message.answer("📞 Ваш персональный менеджер: +7 (499) 390-85-04\nМенеджеру также отправлено уведомление о вашем запросе.")

@router.message(F.web_app_data)
async def web_app_data_handler(message: Message, http_session: aiohttp.ClientSession):
    """Handle data returned from the catalog WebApp."""
    try:
        data = json.loads(message.web_app_data.data)
        items = data.get("items", [])
        total = data.get("total", 0)
        
        if not items:
            await message.answer("🛒 Ваша корзина пуста.")
            return

        summary = "🛒 *Ваш Заказ:*\n\n"
        for item in items:
            summary += f"• {item.get('name')} x{item.get('quantity', 1)} — {item.get('price', 0):,} ₽\n"
        
        summary += f"\n💰 *Итого: {total:,} ₽*"
        
        # Send to Backend
        try:
            payload = {
                "source": "bot_order",
                "name": message.from_user.full_name,
                "phone": data.get("phone", "N/A"),
                "message": f"Заказ из WebApp:\n{summary}",
                "meta": {
                    "telegram_id": message.from_user.id,
                    "items": items,
                    "total": total
                }
            }
            await http_session.post(f"{BACKEND_URL}/ingest/leads", json=payload)
        except Exception as api_e:
            logger.error(f"API Error in WebApp handler: {api_e}")

        await message.answer(
            f"{summary}\n\n✅ *Заказ принят!* Менеджер свяжется с вами для уточнения деталей оплаты и доставки.",
            parse_mode="Markdown"
        )
    except Exception as e:
        logger.error(f"Error handling WebApp data: {e}")
        await message.answer("❌ Произошла ошибка при обработке заказа. Пожалуйста, попробуйте еще раз.")
