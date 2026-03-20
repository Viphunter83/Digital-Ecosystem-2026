# 🚀 Digital Ecosystem 2026 — AI Context Prompt

> **Дата последнего обновления**: 20 марта 2026
> **Версия**: 2.0 (Актуализация: Global Domain Sync + SEO Audit)
> **Статус**: Стабилен, проведена полная синхронизация репозитория и сервера

---

## 📋 ОБЗОР И БИЗНЕС-ЛОГИКА
**Digital Ecosystem 2026** — B2B экосистема для ТД "РусСтанкоСбыт".
- **Каталог**: Гибридный поиск (Keyword + Semantic) промышленного оборудования.
- **SEO & Navigation**: Переход на ЧПУ (Slugs). Система поддерживает поиск `fetchByIdOrSlug`.
- **Сервис**: Цифровые паспорта станков, отслеживание ТО, заявки инженерам через Telegram Mini App.
- **CRM**: Полная интеграция с AmoCRM (создание сделок из бота/сайта).

---

## 🔐 ТЕХНИЧЕСКИЙ СТРУКТУРА И ДОСТУПЫ

### 1. Directus 11 (CMS)
- **URL**: https://admin.td-rss.ru
- **Интерфейс**: Характеристики (`specs`) переведены на Repeater/Key-Value для исключения ошибок JSON.
- **SEO**: Поля `slug`, `meta_title`, `meta_description` обязательны для заполнения (slug генерируется автоматически).

### 2. Infrastructure (SSH & Dokploy)
- **Host**: `ssh root@<SERVER_IP>` (используй инструмент `run_command` для SSH-действий).
- **Path**: `/etc/dokploy/compose/russtanko-russtankoprod-colyja/code`
- **Workflow**: При добавлении переменных в `.env` обязательно дублируй их в панель Dokploy.

---

## 🛠️ WORKFLOW ДЛЯ ИИ (ИНСТРУКЦИИ)

### 1. Git & Deployment
**CRITICAL**: Dokploy настроен на автодеплой из `main`.
- **Проверка**: Перед пушем всегда запускай `npm run build --prefix apps/frontend` для проверки типов.
- **Commit**: Используй семантические сообщения (например, `feat: implement slug routing`).

### 2. Работа со Slugs (ЧПУ)
- **Backend**: Эндпоинты `/catalog/{id_or_slug}` и `/journal/{id_or_slug}` поддерживают оба формата.
- **Frontend**: Используется структура `app/catalog/[slug]/page.tsx`. Параметр `slug` передается в API-функции.
- **Sitemap**: Генерируется динамически в `apps/frontend/src/app/sitemap.ts`.

### 3. Directus Metadata Management
- При изменении структуры полей используй `mcp_directus-mcp_update-field`.
- Если интерфейс в админке не обновился (кэш), инструктируй пользователя сделать **Hard Reload** (Cmd+Shift+R).

---

## ✅ ЗАВЕРШЕНО (Январь 2026)
- [x] **SEO 2026**: Переход на ЧПУ, динамический Sitemap, Server Side Metadata.
- [x] **Directus UI**: Упрощение ввода спецификаций, исправление загрузки фото.
- [x] **Leads**: Интеграция с AmoCRM (Долгосрочные токены).
- [x] **Mail Migration**: Полный переезд на `zakaz@td-rss.ru` (Global Patching).
- [x] **Sync**: Локальный репозиторий синхронизирован с живыми патчами сервера.

---

## ⚠️ ЗАМЕТКИ ДЛЯ СЛЕДУЮЩЕЙ СЕССИИ
1. **Migrations**: Новые таблицы/поля — через `packages/database/migrations` (`YYYYMMDDHHMMSS_name.sql`).
2. **Type Safety**: При добавлении полей в Directus обновляй интерфейсы в `apps/frontend/src/lib/api.ts`.
3. **SSH**: Для быстрой отладки логов на сервере используй `docker logs -f <container_name> --tail 100`.

---
*Документ актуализирован для сессии v1.7. Системы готовы к работе.*
