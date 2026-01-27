import logging
import aiohttp
from aiogram import Router, F, types
from aiogram.types import Message

from .common import BACKEND_URL, logger

router = Router()

@router.message(F.text == "📊 Сводка Расходов")
async def director_stats(message: Message, http_session: aiohttp.ClientSession):
    try:
        async with http_session.get(f"{BACKEND_URL}/analytics/director-stats") as resp:
            if resp.status == 200:
                data = await resp.json()
                
                service_total = data.get("service_total", 0)
                orders_total = data.get("orders_total", 0)
                active_leads = data.get("active_leads", 0)
                
                response = (
                    "📊 *Финансовая Сводка (2026)*\n\n"
                    f"💰 Всего потрачено на ТО: {service_total:,} ₽\n"
                    f"🛍 Заказы запчастей: {orders_total:,} ₽\n"
                    f"📂 Активных заявок: {active_leads}\n\n"
                    f"📈 {data.get('summary', 'Данные за текущий период')}\n"
                    "━━━━━━━━━━━━━━━━━━\n"
                    "👇 Аналитика обновляется в режиме real-time на основе данных из БД и CRM."
                )
                await message.answer(response, parse_mode="Markdown")
            else:
                await message.answer("⚠️ Не удалось получить данные аналитики. Попробуйте позже.")
    except Exception as e:
        logger.error(f"Error fetching director stats: {e}")
        await message.answer("❌ Ошибка при запросе аналитики.")

@router.message(F.text == "🏆 Активные Проекты")
async def director_projects(message: Message):
    await message.answer(
        "🏭 *Текущие проекты Модернизации:*\n\n"
        "1. **Модернизация Цеха №2**\n"
        "   Статус: 🟡 В работе\n"
        "   Бюджет: 12.5 млн ₽\n"
        "   Срок сдачи: Март 2026\n\n"
        "2. **Установка ЧПУ на ГФ2171**\n"
        "   Статус: 🟢 Завершено\n"
        "   Ожидаемый эффект: +25% к производительности",
        parse_mode="Markdown"
    )

@router.message(F.text == "💎 Персональное Предложение")
async def director_offer(message: Message):
    await message.answer(
        "💎 *Спецпредложение для вашей компании:*\n\n"
        "При заключении договора на сервисное обслуживание до *01.02.2026*:\n"
        "✅ **Скидка 15%** на запчасти в течение года\n"
        "✅ **Бесплатный** ежеквартальный аудит оборудования\n\n"
        "Скачать КП: [offer_2026_premium.pdf](https://russtankosbyt.ru/promo/premium)",
        parse_mode="Markdown"
    )

@router.message(F.text == "📞 Менеджер")
async def call_manager_dir(message: Message):
    await message.answer("📞 Ваш персональный менеджер: +7 (499) 390-85-04\nМенеджеру также отправлено уведомление о вашем запросе.")
