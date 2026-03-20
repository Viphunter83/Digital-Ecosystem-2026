# Digital Ecosystem 2026

## 🚀 Overview
PWA-платформа для **ТД «РусСтанкоСбыт»**, предназначенная для автоматизации продаж промышленного оборудования, ведения цифровых паспортов станков и управления сервисным обслуживанием.

## 🏗 Architecture
Проект построен на современном стеке:
- **Frontend**: Next.js 14/15, TailwindCSS, Shadcn/UI.
- **Backend**: FastAPI (Python 3.10+), PostgreSQL + pgvector.
- **CMS**: Directus 11+ для управления контентом и медиа.
- **Bot**: Telegram Bot (Aiogram 3) для взаимодействия с инженерами и клиентами.

Подробная документация:
- 📑 [Общая архитектура](docs/ARCHITECTURE.md)
- 📍 [Текущее состояние системы](docs/PROJECT_STATE.md)
- 💾 [Схема базы данных](docs/DATABASE.md)
- ⚙️ [Методология работы Агента](docs/AGENT_WORKFLOW.md)
- 🛠 [Руководство по Directus](docs/directus_user_guide.md)
- 🔍 [SEO стратегия](docs/SEO_STRATEGY_2026.md)

## 🛠 Development & Deployment

### Локальный запуск
```bash
docker-compose up -d --build
```
- **Сайт**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000/docs`
- **Directus**: `http://localhost:8055`

### Продакшн (Production)
- **Главный сайт**: [td-rss.ru](https://td-rss.ru)
- **API**: [api.td-rss.ru](https://api.td-rss.ru)
- **Admin**: [admin.td-rss.ru](https://admin.td-rss.ru)

Проект развернут на сервере через **Dokploy**. 
- **CI/CD**: Автоматический деплой при пуше в ветку `main`.
- **Инфраструктура**: Описана в [руководстве по деплою](docs/DEPLOYMENT.md).
- **Обслуживание**: Инструкции по безопасности и логам в [Maintenance Guide](docs/MAINTENANCE.md).

## 📁 Project Structure
- `apps/frontend`: Приложение на Next.js.
- `apps/backend`: Основной API сервис (FastAPI).
- `apps/bot`: Телеграм-бот (Aiogram 3).
- `packages/database`: Общие модели SQLAlchemy и миграции.
- `infra/`: Конфигурации Traefik, Directus и сценарии обслуживания.
- `docs/`: Техническая и системная документация.
