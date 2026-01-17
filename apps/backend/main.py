from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, select
from typing import List, Optional
import os
import subprocess

from packages.database.models import Base, Product, Article, Project

app = FastAPI(
    title="Digital Ecosystem 2026 API",
    description="Backend API for RusStankoSbyt PWA Platform",
    version="0.2.0"
)

# Database Setup (Quick & Dirty for Monorepo Prototype)
# In production, move to app/core/database.py
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/digital_ecosystem")
engine = create_engine(DB_URL)

def get_db():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

# Configure CORS
origins = ["*"] # Allow all for local dev

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Digital Ecosystem 2026 API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- Task 3: API Endpoints ---

def run_ingestion_script(script_name: str):
    # This assumes scripts are executable or run via python
    # Path is relative to container WORKDIR /app
    logging.info(f"Triggering {script_name}")
    subprocess.run(["python", f"scripts/ingest/{script_name}.py"])

@app.post("/ingest/trigger")
async def trigger_ingestion(background_tasks: BackgroundTasks):
    """
    Trigger the data ingestion process asynchronously.
    """
    background_tasks.add_task(run_ingestion_script, "ingest_excel")
    background_tasks.add_task(run_ingestion_script, "ingest_pdf")
    return {"status": "Ingestion started", "details": "Excel and PDF parsing running in background"}

@app.get("/catalog/search")
def search_catalog(q: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Search products by name or description.
    TODO: Integrate pgvector for semantic search.
    """
    query = select(Product)
    if q:
        query = query.where(Product.name.ilike(f"%{q}%"))
    
    results = db.execute(query).scalars().all()
    return {"results": results}

@app.get("/journal")
def get_journal(db: Session = Depends(get_db)):
    """
    Get list of articles.
    """
    query = select(Article).order_by(Article.created_at.desc())
    results = db.execute(query).scalars().all()
    return {"articles": results}

import logging
logging.basicConfig(level=logging.INFO)

