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

## 2. Critical Fixes & Updates (2026-01-20)

### 🔧 Infrastructure & Stability
1.  **Service Discovery Fixed (Directus/Redis)**:
    *   **Issue**: Directus crashed (`ECONNREFUSED`) because it used a hardcoded IP for Redis (`172.18.0.5`) which changed after a container restart.
    *   **Fix**: Updated `docker-compose.prod.yml` to use Docker service names (`redis`, `db`) instead of hardcoded IPs. This ensures automatic DNS resolution regardless of internal IP changes.

### 🔧 Previous Fixes (2026-01-19)

### 🔧 Stability & Content Fixes
1.  **Backend Caching & Serialization**:
    *   **Issue**: Redis was caching Python's string representation of objects (e.g., `id=UUID(...)`) instead of valid JSON.
    *   **Fix**: Implemented `fastapi.encoders.jsonable_encoder` in `cache.py` to correctly serialize Pydantic models before caching.
    
2.  **Frontend Image Loading**:
    *   **Issue**: Images failed to load in Docker/Tunnel environment due to optimization errors (500/404).
    *   **Fix**: Disabled Next.js Image Optimization (`unoptimized: true`) in `next.config.mjs`. Images are now served directly as static assets.
    *   **Data**: All products now have unique, correct image paths (`product_milling.png` created to resolve duplicate).

3.  **Catalog & Search**:
    *   **Fixed Infinite Loading**: Added `try/catch/finally` block for `loading` state in `Home` and `Catalog` pages.
    *   **Fixed Empty Catalog**: Made `q` parameter optional in `/catalog/search` endpoint. Previously, missing `q` caused 422 errors.
    *   **Fixed Filters**: Mapped Russian UI filters ("МЕХАНООБРАБОТКА") to English DB categories ("Turning", "Milling", etc.).
    *   **Fixed Search Reset**: Clicking "ВСЕ" now explicitly clears the search query and reloads the full catalog.

4.  **Infrastructure & Bot**:
    *   **Cloudflare Tunnel**: Restored connectivity with new URL.
    *   **Telegram Bot**: Updated `WEB_APP_URL` in env and **restarted bot container** to pick up the change. Mini App is fully functional.

5.  **Production Hardening (Phase 6)**:
    *   **Backend Security**: Restricted `BACKEND_CORS_ORIGINS` to safe domains and added `SECRET_KEY` validation check.
    *   **Frontend Dynamic Content**: Refactored `Footer`, `NavBar`, and `FAQSection` to fetch content from `site_content` table (seeded via migrations) instead of hardcoded strings. This prepares the app for CMS management.

### 📝 Content Additions
- Added 3rd Journal Article ("Predictive Analytics").
- Assigned unique images to all 5 catalog items.
- Fixed product "ID" crash (added safety check in `ProductCard`).

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
