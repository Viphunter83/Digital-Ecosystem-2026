# Architecture Handoff & Context

This document summarizes the current state of the **Digital Ecosystem 2026** project to facilitate a seamless transition for the next development iteration.

## 1. Project Status (as of 2026-01-18)

### ✅ Completed
- **Infrastructure**: Monorepo with Docker Compose. Fixed **Mixed Content** issues via Nginx/Uvicorn proxy headers.
- **Backend API**: FastAPI running on port 8000.
    - Endpoints: `/projects` (List/Detail), `/journal`, `/catalog/search` (Hybrid Search), `/ingest/leads`.
    - Middleware: Request logging and Proxy Headers support.
    - Database: PostgreSQL with `pgvector` and UUIDs.
- **Frontend**: Next.js 15 + Shadcn/UI + Tailwind.
    - **UX**: Dynamic Hero Section (Role-based content & images), Typographic fixes (Hyphens).
    - **Map & Projects**: Interactive Map with Popups -> Dynamic Project Detail Pages (`/projects/[id]`).
    - **Visuals**: "Cyber-Industrial" theme with custom generated backgrounds (`bg_tech.png`).
- **Data Ingestion**:
    - AI-powered parsing for Excel/PDF.
    - Demo Data Seeding with consistent Project Backgrounds.

### 🚧 In Progress / Next Steps
- **Cart Functionality**: `BottomNav` has a Cart tab, but the checkout flow is not fully implemented.
- **Production Deployment**: SSL certificate configuration and final Docker optimization.

## 2. Technical Stack & Configuration

### Environment Variables (`.env`)
- **Database**: `DATABASE_URL`
- **Frontend**: `NEXT_PUBLIC_API_URL=/api` (Relative path for proxying).
- **AI**: ProxyAPI (OpenAI compatible).

### Telegram Integration (New)
- **Provider**: `TelegramProvider.tsx` wraps the app.
- **Mocking**: `useTelegram` hook includes mock data for development outside Telegram.
- **Native Features**:
    - `HapticFeedback.impactOccurred('medium')`
    - `MainButton.setText()` / `MainButton.show()`
    - `WebApp.expand()`

## 3. How to Run

1. **Start System**:
   ```bash
   docker-compose up -d --build
   ```
2. **Access**:
   - **Web**: http://localhost:3000 (Normal View)
   - **TMA Emulation**: Open in mobile view, verify `BottomNav` appears.

3. **Verify TMA**:
   - Check console for `Telegram WebApp is undefined, using mock` (Localhost).
   - In Telegram: `initData` will be populated, `BottomNav` visible.

## 4. Key Directives for Next Session
- **Checkout**: Implement the "Cart" logic and order submission to Telegram bot.
- **Diagnostics**: Connect the "Submit" action in Diagnostics to a backend endpoint or Bot API.
- **Performance**: Optimize image loading (some holographic assets are large).
