from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from apps.backend.app.core.config import settings
from apps.backend.app.core.database import engine, get_db
from apps.backend.app.routers import catalog, journal, projects, services, diagnostics, integrations

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Logging Middleware
@app.middleware("http")
async def log_requests(request, call_next):
    import logging
    logger = logging.getLogger("uvicorn")
    logger.info(f"Incoming Request: {request.method} {request.url}")
    logger.info(f"Headers: {request.headers}")
    
    response = await call_next(request)
    
    logger.info(f"Response Status: {response.status_code}")
    if response.status_code >= 300 and response.status_code < 400:
        logger.info(f"Redirect Location: {response.headers.get('location')}")
        
    return response

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(services.router, prefix="/ingest", tags=["ingestion"])
app.include_router(catalog.router, prefix="/catalog", tags=["catalog"])
app.include_router(journal.router, prefix="/journal", tags=["journal"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(diagnostics.router, prefix="/diagnostics", tags=["diagnostics"])
app.include_router(integrations.router, prefix="/integrations", tags=["integrations"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Digital Ecosystem 2026 API"}

@app.get("/health")
def health_check():
    try:
        # Check DB connection
        with engine.connect() as connection:
            connection.execute(select(1))
        return {"status": "ok", "db": "connected"}
    except Exception:
        return {"status": "error", "db": "disconnected"}
