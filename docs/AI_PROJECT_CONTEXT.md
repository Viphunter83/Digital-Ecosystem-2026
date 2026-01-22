# 🚀 Digital Ecosystem 2026 — AI Context Prompt

> **Дата создания**: 22 января 2026
> **Версия**: 1.0
> **Назначение**: Промпт для быстрого входа в контекст проекта

---

## 📋 КРАТКОЕ ОПИСАНИЕ ПРОЕКТА

**Digital Ecosystem 2026** — B2B маркетплейс промышленного оборудования для компании ТД "РусСтанкоСбыт" (tdrusstankosbyt.ru).

### Ключевые функции:
- 🔍 Каталог оборудования с гибридным поиском (keyword + semantic/pgvector)
- 🤖 Telegram Mini App (TMA) для мобильного доступа
- 📊 Система лидогенерации и заявок
- 🗺️ Интерактивная карта проектов
- 📝 Журнал статей (блог)
- 🎯 Directus CMS для управления контентом

---

## 🌐 PRODUCTION URLs

| Сервис | URL | Порт |
|--------|-----|------|
| **Frontend** | https://td-rss.ru | 3000 |
| **Backend API** | https://api.td-rss.ru | 8000 |
| **Directus CMS** | https://admin.td-rss.ru | 8055 |
| **Traefik Dashboard** | http://server-ip:8080 | 8080 |

---

## 🔐 ИНТЕГРАЦИИ И ДОСТУПЫ

### 1. SSH — Удалённый сервер

```bash
# Подключение к серверу Dokploy
ssh root@194.156.118.128

# Пароль хранится у заказчика
# После входа — перейти в директорию проекта
cd /etc/dokploy/compose/russtanko-russtankoprod-colyja/code
```

**Полезные команды на сервере:**
```bash
# Просмотр логов контейнеров
docker logs -f <container_name>

# Перезапуск сервиса
docker-compose -f docker-compose.prod.yml restart <service_name>

# Пересборка и деплой
docker-compose -f docker-compose.prod.yml up -d --build

# Статус всех контейнеров
docker ps

# Подключение к PostgreSQL
docker exec -it <db_container> psql -U postgres -d digital_ecosystem
```

### 2. GitHub Repository

```bash
# Репозиторий
https://github.com/Viphunter83/Digital-Ecosystem-2026

# Клонирование
git clone https://github.com/Viphunter83/Digital-Ecosystem-2026.git

# Ветка по умолчанию: main
```

**Git Workflow:**
```bash
# Локальная работа
cd "/Users/apple/Digital Ecosystem 2026"
git add .
git commit -m "feat: описание изменений"
git push origin main

# На сервере — pull и пересборка
ssh root@194.156.118.128
cd /etc/dokploy/compose/russtanko-russtankoprod-colyja/code
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Directus CMS (MCP интеграция)

**Учётные данные админа:**
- **Email**: olegvakin@gmail.com
- **Пароль**: Vo52835283 (ВАЖНО: "o" — буква, не цифра!)

**Настроенные коллекции:**
| Коллекция | Таблица БД | Назначение |
|-----------|------------|------------|
| Контент сайта | `site_content` | Тексты Hero, заголовки, кнопки |
| Решения | `solutions` | Карточки услуг |
| Офисы | `offices` | Контактная информация |
| Производственные площадки | `production_sites` | Информация о площадках |
| Статьи | `articles` | Блог |
| Категории | `categories` | Категории товаров |

**MCP Server для Directus:**
- Настроен через `dockploy-blog` MCP
- Доступ к PostgREST API через `mcp_dockploy-blog_postgrestRequest`

### 4. Dokploy CLI

**Установка и использование:**
```bash
# Dokploy — self-hosted PaaS (альтернатива Vercel/Heroku)
# Панель управления доступна на сервере

# Основные операции через docker-compose
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml restart
docker-compose -f docker-compose.prod.yml up -d --build
```

**Traefik Labels** (в docker-compose.prod.yml):
- Автоматическое HTTPS через Let's Encrypt
- Роутинг по доменам (td-rss.ru, api.td-rss.ru, admin.td-rss.ru)

---

## 🏗️ АРХИТЕКТУРА ПРОЕКТА

### Структура монорепозитория:

```
Digital Ecosystem 2026/
├── apps/
│   ├── backend/          # FastAPI (Python)
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── core/     # config, security, cache
│   │   │   ├── routers/  # API endpoints
│   │   │   ├── models/   # SQLAlchemy models
│   │   │   └── services/ # Business logic
│   │   └── scripts/      # Миграции, сиды, утилиты
│   │
│   ├── frontend/         # Next.js 15 (TypeScript)
│   │   ├── src/
│   │   │   ├── app/      # App Router pages
│   │   │   ├── components/
│   │   │   └── lib/      # API client, utils
│   │   └── public/       # Статические файлы
│   │
│   └── bot/              # Telegram Bot (Python)
│       ├── main.py
│       └── handlers.py
│
├── supabase/
│   └── migrations/       # SQL миграции (14 файлов)
│
├── infra/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── docker-compose.yml        # Для локальной разработки
├── docker-compose.prod.yml   # Для production
├── .env                      # Локальные переменные
└── dockploy_env.txt          # Шаблон prod переменных
```

### Сервисы Docker:

| Сервис | Образ | Порт | Назначение |
|--------|-------|------|------------|
| backend | Custom (FastAPI) | 8000 | REST API |
| frontend | Custom (Next.js) | 3000 | Web UI |
| bot | Custom (Python) | — | Telegram Bot |
| db | ankane/pgvector | 5432 | PostgreSQL + vectors |
| redis | redis:alpine | 6379 | Кэширование |
| directus | directus/directus | 8055 | CMS |
| traefik | traefik:v2.11 | 80,443,8080 | Reverse Proxy |

---

## 💾 БАЗА ДАННЫХ

### Основные таблицы:

| Таблица | Назначение |
|---------|------------|
| `products` | Каталог оборудования |
| `spare_parts` | Запчасти |
| `categories` | Категории товаров |
| `projects` | Реализованные проекты |
| `articles` | Статьи журнала |
| `leads` | Заявки клиентов |
| `site_content` | Динамический контент сайта |
| `solutions` | Решения для бизнеса |
| `offices` | Контакты офисов |
| `production_sites` | Производственные площадки |

### Миграции (supabase/migrations/):
```
20260117173000_init_schema.sql
20260118104000_add_roles.sql
20260119115911_update_leads_enum.sql
20260119145457_add_spare_part_images.sql
20260119165500_add_is_published.sql
20260119175024_add_cart_order_source.sql
20260119201500_add_site_content.sql
20260119203000_add_categories.sql
20260119210000_seed_site_content.sql
20260119210500_seed_faq.sql
20260121151553_cleanup_catalog_data.sql
20260121202102_add_dynamic_content_tables.sql
20260122030737_update_contacts_info.sql
20260122031556_add_company_hero_content.sql
```

**Применение миграций:**
```bash
# Локально
python apps/backend/scripts/apply_migrations.py

# На сервере (автоматически при старте backend)
# см. command в docker-compose.prod.yml
```

---

## 🔧 ENVIRONMENT VARIABLES

### Локальный .env:
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=digital_ecosystem
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/digital_ecosystem

# Backend
API_V1_STR=/api/v1
PROJECT_NAME="Digital Ecosystem 2026"
SECRET_KEY=CHANGE_THIS_IN_PRODUCTION

# Frontend
NEXT_PUBLIC_API_URL=/api

# AI (ProxyAPI.ru)
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.proxyapi.ru/openai/v1
OPENAI_MODEL_CHAT=gpt-4o-mini
OPENAI_MODEL_EMBEDDING=text-embedding-3-small

# Telegram Bot
TELEGRAM_BOT_TOKEN=xxx
WEB_APP_URL=https://td-rss.ru

# Directus (на сервере)
DIRECTUS_KEY=REDACTED_DIRECTUS_KEY
DIRECTUS_SECRET=REDACTED_DIRECTUS_SECRET
ADMIN_EMAIL=admin@russtanko.ru
ADMIN_PASSWORD=REDACTED_ADMIN_PWD

# Новые переменные (добавить в Dokploy)
TELEGRAM_ADMIN_CHAT_ID=45053735
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=da2795c4-0e28-4f3a-b58a-83432b0942b2
```

---

## ✅ ТЕКУЩИЙ СТАТУС (22 января 2026)

### Завершено:
- [x] Инфраструктура: Docker Compose, Traefik, HTTPS
- [x] Backend API: FastAPI с гибридным поиском
- [x] Frontend: Next.js 15 + Tailwind + Shadcn/UI
- [x] Telegram Mini App интеграция
- [x] Каталог с фильтрацией и пагинацией
- [x] Динамический контент (Hero, Company, Solutions, Contacts)
- [x] Directus CMS полностью настроен
- [x] Исправлена 500 ошибка в /api/diagnostics/analyze (добавлена надежная обработка ошибок и фоллбек)
- [x] Исправлен 404 для /content/ (добавлен завершающий слэш в API кликнте)
- [x] Добавлен отсутствующий ассет grid-pattern.svg (fix 404)
- [x] Условная загрузка API ключа Яндекс Карт (предотвращает ошибки в консоли при отсутствии ключа)
- [x] Руководство для заказчика на русском языке

### В процессе / Следующие шаги:
- [ ] Финализация корзины и оформления заказа (checkout flow)
- [ ] Оптимизация производительности изображений (Next.js Image)
- [ ] Решение проблемы с валидностью ключа Яндекс Карт на домене td-rss.ru
- [ ] Настройка мониторинга и алертов

---

## ⚠️ ИЗВЕСТНЫЕ ПРОБЛЕМЫ И ЗАМЕТКИ ДЛЯ РАЗРАБОТКИ

1. **Yandex Maps API Key** — На домене `td-rss.ru` ключ из переменных окружения `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` выдает ошибку "Invalid API key". Требуется проверка привязки ключа к домену в кабинете разработчика Яндекса.
2. **Кэширование** — После обновлений фронтенда на проде (через Dokploy rebuild) может потребоваться жесткий сброс кэша (`Cmd+Shift+R`), так как старые 404 могут кэшироваться браузером.
3. **Diagnostics Logging** — В бэкенд добавлено подробное логирование трейсбэков для диагностики AI. Смотреть логи: `docker logs russtanko-russtankoprod-colyja-backend-1`.
4. **Standalone Frontend** — Фронтенд собирается в режиме `standalone`. При изменении файлов в `src` требуется полная пересборка контейнера (`docker compose up -d --build frontend`).

---

## 🛠️ ПОЛЕЗНЫЕ КОМАНДЫ ДЛЯ СИНХРОНИЗАЦИИ

Если нужно быстро применить правки бэкенда без полной пересборки:
```bash
# 1. Синхронизация файла на сервер
scp apps/backend/app/routers/diagnostics.py root@194.156.118.128:/tmp/diagnostics.py

# 2. Копирование в контейнер и рестарт
ssh root@194.156.118.128 "docker cp /tmp/diagnostics.py russtanko-russtankoprod-colyja-backend-1:/app/apps/backend/app/routers/diagnostics.py && docker restart russtanko-russtankoprod-colyja-backend-1"
```

Для фронтенда (требуется билд):
```bash
ssh root@194.156.118.128 "cd /etc/dokploy/compose/russtanko-russtankoprod-colyja/code && docker compose -f docker-compose.prod.yml -p russtanko-russtankoprod-colyja up -d --build frontend"
```

---

## 📚 КЛЮЧЕВЫЕ ФАЙЛЫ ДЛЯ ИЗУЧЕНИЯ

| Файл | Назначение |
|------|------------|
| `ARCHITECTURE_HANDOFF.md` | Техническая документация |
| `docker-compose.prod.yml` | Production конфигурация |
| `apps/backend/app/main.py` | Точка входа FastAPI |
| `apps/frontend/src/lib/api.ts` | API клиент фронтенда |
| `apps/frontend/src/app/page.tsx` | Главная страница |
| `supabase/migrations/` | Все миграции БД |
| `docs/directus_user_guide.md` | Гайд для заказчика |

---

## 📞 КОНТАКТЫ

- **Заказчик**: Олег Вакин (olegvakin@gmail.com)
- **Telegram**: @olegvakin
- **Сайт компании**: https://tdrusstankosbyt.ru

---

> **Примечание**: Этот документ следует обновлять при значительных изменениях в проекте.
