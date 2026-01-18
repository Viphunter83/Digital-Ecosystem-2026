from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton

# --- Onboarding / Role Selection ---
role_selection_kb = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="👷♂️ Гл. Инженер / Механик", callback_data="role_engineer")],
    [InlineKeyboardButton(text="💼 Снабженец / Закупщик", callback_data="role_procurement")],
    [InlineKeyboardButton(text="👔 Директор / Собственник", callback_data="role_director")]
])

# --- Role: Engineer (Technical Focus) ---
engineer_kb = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="🏭 Мой Парк"), KeyboardButton(text="🔧 Статус Ремонта")],
        [KeyboardButton(text="🛠 Вызвать Сервис"), KeyboardButton(text="📚 База Знаний")]
    ],
    resize_keyboard=True,
    is_persistent=True,
    input_field_placeholder="Инженерное меню"
)

# Check ENV for WebApp URL
import os
from aiogram.types import WebAppInfo

WEB_APP_URL = os.getenv("WEB_APP_URL", "https://russtankosbyt.ru/catalog")

# --- Role: Procurement (Logistic/Finance Focus) ---
procurement_kb = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="📄 Запросить Счёт/КП"), KeyboardButton(text="🚚 Где мой груз?")],
        [KeyboardButton(text="📦 Каталог Запчастей", web_app=WebAppInfo(url=WEB_APP_URL)), KeyboardButton(text="📞 Менеджер")]
    ],
    resize_keyboard=True,
    is_persistent=True,
    input_field_placeholder="Меню снабжения"
)

# --- Role: Director (Business Focus) ---
director_kb = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="📊 Сводка Расходов"), KeyboardButton(text="🏆 Активные Проекты")],
        [KeyboardButton(text="💎 Персональное Предложение"), KeyboardButton(text="📞 Менеджер")]
    ],
    resize_keyboard=True,
    is_persistent=True,
    input_field_placeholder="Кабинет руководителя"
)

# --- Helper Keyboards ---
# For Procurement - "Get Invoice" action
invoice_method_kb = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="📤 Отправить фото шильдика", callback_data="invoice_photo")],
    [InlineKeyboardButton(text="📎 Загрузить Excel заявку", callback_data="invoice_excel")]
])

# For Cargo Tracking
cargo_dummy_kb = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Проверить по номеру заказа", callback_data="cargo_check")]
])
