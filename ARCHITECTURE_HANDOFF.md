# Architecture Handoff & Context

This document summarizes the current state of the **Digital Ecosystem 2026** project to facilitate a seamless transition for the next development iteration.

## 1. Project Status (as of 2026-01-18)

### ✅ Completed
- **Infrastructure**: Monorepo with Docker Compose. Fixed **Mixed Content** issues via Nginx/Uvicorn proxy headers.
- **Backend API**: FastAPI running on port 8000 (accessible via `/api` proxy).
    - Endpoints: `/projects`, `/journal`, `/catalog/search` (Hybrid Search).
    - Middleware: Request logging and Proxy Headers support.
- **Frontend**: Next.js 15 + Shadcn/UI + Tailwind.
    - **UI/UX**: "Industrial Premium" theme with high-contrast fixes, neon effects, and holographic assets.
    - **Localization**: Full Russian translation for Product Cards (Specs, Categories) and System Messages.
    - **Telegram Mini App (TMA)**:
        - `TelegramProvider`: Auto-detects user, expands app, handles Haptic Feedback.
        - `BottomNav`: Sticky mobile navigation (Home, Catalog, Diagnostics, Cart).
        - `DiagnosticsWidget`: Integrated with native `MainButton`.
- **Data Ingestion**:
    - AI-powered parsing for Excel/PDF.
    - Data seeding scripts for initial deployment.

### 🚧 In Progress / Next Steps
- **Cart Functionality**: `BottomNav` has a Cart tab, but the checkout flow is not fully implemented.
- **Admin Panel**: Need a dedicated interface for managing products/projects without DB access.
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
