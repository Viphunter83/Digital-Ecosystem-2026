# 📍 Текущее состояние проекта (Project State)

> **Последнее обновление**: 20 марта 2026
> **Версия системы**: 2.0.0 (Global Email & Domain Sync)

## 🌐 Домены и Экосистема
- **Главный сайт**: [td-rss.ru](https://td-rss.ru)
- **API (Backend)**: [api.td-rss.ru](https://api.td-rss.ru)
- **Admin Panel (Directus)**: [admin.td-rss.ru](https://admin.td-rss.ru)

## 📧 Контакты и Уведомления
- **Основной Email**: `zakaz@td-rss.ru` (Все формы сайта и уведомления переведены на этот адрес).
- **CRM Integration**: AmoCRM подключена к ящику `zakaz@td-rss.ru` (Beget IMAP/SMTP).

## 🏗 Инфраструктура (Production)
- **Сервер**: SSH root@194.156.118.128
- **Панель управления**: Dokploy (Traefik + Docker Compose)
- **Путь к коду**: `/etc/dokploy/compose/russtanko-russtankoprod-colyja/code`

### Активные контейнеры:
1. `frontend` (Next.js 15, Standalone mode)
2. `backend` (FastAPI, Python 3.10)
3. `directus` (CMS, Directus 11)
4. `db` (PostgreSQL + pgvector)
5. `redis` (Cache & Queue)
6. `bot` (Aiogram 3, Telegram Bot)

## 🛠 Последние ключевые изменения (Март 2026)
1. **Миграция Email**: Глобальная замена домена `tdrusstankosbyt.ru` на `td-rss.ru` во всем коде фронтенда и базе данных.
2. **SEO Sync**: Унификация SEO-стратегии для десктопной и мобильной версий. Настройка редиректов для сохранения веса старых страниц Tilda.
3. **Standalone Build**: Фронтенд переведен в режим `standalone` для оптимизации работы внутри Docker.
4. **Репозиторий**: Локальная версия синхронизирована с патчами на сервере (Hotfixes).
5. **Infrastructure Fix**: Устранена петля перенаправлений (`ERR_TOO_MANY_REDIRECTS`) путем очистки меток Traefik и удаления конфликтующих контейнеров. Добавлена поддержка `www.td-rss.ru`.

---
*Данный документ является мастер-справкой для ИИ-агентов и разработчиков.*
