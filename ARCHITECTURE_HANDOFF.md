# Architecture Handoff & Context

This document summarizes the current state of the **Digital Ecosystem 2026** project to facilitate a seamless transition for the next development iteration.

## 1. Project Status (as of 2026-01-17)

### ✅ Completed
- **Infrastructure**: Monorepo with Docker Compose (Backend, Frontend, Postgres+pgvector).
- **Database**: PostgreSQL schema designed and implemented via SQLAlchemy models.
- **Backend API**: FastAPI running on port 8000.
    - Endpoints: `/ingest/trigger`, `/catalog/search`, `/journal`.
    - Dependencies: `openai` (ProxyAPI), `sqlalchemy`, `pypdf`, `pandas`, `pgvector`.
- **Frontend**: Next.js 15 + Shadcn/UI + Tailwind (Industrial Premium Theme).
    - Components: `ProductCard`, `TechnicalSpecTable`, `NavBar`.
- **Data Ingestion**:
    - Scripts in `apps/backend/scripts/ingest/`.
    - **Excel**: For References/Projects (`ingest_excel.py`).
    - **PDF**: For Knowledge Base (`ingest_pdf.py`).
    - **AI**: Integrated ProxyAPI for generating embeddings (`text-embedding-3-small`).

### 🚧 In Progress / Next Steps
- **Data Parsing Logic**: The ingestion scripts currently have *connected* AI calls but use **stubbed logic** for column mapping (e.g., looking for specific columns in Excel).
    - *Action Required*: Fine-tune `ingest_excel.py` to match the exact columns of the provided `Справка_референс_*.xlsx`.
- **Frontend Integration**: The Frontend is currently using mock data.
    - *Action Required*: Connect `ProductCard` and other components to the FastAPI endpoints.
- **Search**: The current search is simple SQL `ILIKE`.
    - *Action Required*: Implement vector search using `pgvector` operators (`ORDER BY embedding <-> query_embedding`).

## 2. Technical Stack & Configuration

### Environment Variables (`.env`)
- **Database**: `DATABASE_URL` (configured for both local scripts and docker container).
- **AI**: Uses **ProxyAPI.ru** (OpenAI compatible).
    - `OPENAI_BASE_URL`: `https://api.proxyapi.ru/openai/v1`
    - `OPENAI_MODEL_CHAT`: `gpt-4o-mini`
    - `OPENAI_MODEL_EMBEDDING`: `text-embedding-3-small`

### Database Schema (`packages/database/models.py`)
Key modules:
- **Products**: Heavy machinery with JSONB specs.
- **Projects**: Reference track record (requires Geocoding).
- **Articles**: Engineering journal for SEO.
- **Documents**: Chunked text for RAG.
- **Telegram**: User mapping for future bot.

## 3. How to Run

1. **Start System**:
   ```bash
   docker-compose up -d --build
   ```
2. **Trigger Ingestion** (Mock/Test):
   ```bash
   curl -X POST http://localhost:8000/ingest/trigger
   ```
3. **Access**:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

## 4. Key Directives for Next Session
- **Parsing**: Focus on robustly extracting data from the specific Excel files provided in `_input_materials`.
- **UI**: Build the **Catalog Page** and **Project Map** (using coordinates from `projects` table).
- **AI**: Implement the RAG pipeline for answering technical questions based on `documents`.
