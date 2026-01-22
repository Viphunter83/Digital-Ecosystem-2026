from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
import subprocess
import logging
from typing import List, Any

from apps.backend.app.core.database import get_db
from packages.database.models import Base
from sqlalchemy import Column, UUID, String, Text, JSONB, Boolean, DateTime, func

# Temporary schema for services if not in models.py yet (though I added it via migration)
# We can use text() for simplicity or define the class here if missing from packages/database/models.py
from sqlalchemy import text

router = APIRouter()

def run_ingestion_script(script_name: str):
    logging.info(f"Triggering {script_name}")
    subprocess.run(["python", f"scripts/ingest/{script_name}.py"])

@router.post("/trigger")
async def trigger_ingestion(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_ingestion_script, "ingest_excel")
    background_tasks.add_task(run_ingestion_script, "ingest_pdf")
    return {"status": "Ingestion started", "details": "Excel and PDF parsing running in background"}

@router.get("/")
def get_services(db: Session = Depends(get_db)):
    """
    Get all published services.
    """
    stmt = text("SELECT id::text, slug, title, description, content, sort_order FROM services WHERE is_published = true ORDER BY sort_order")
    results = db.execute(stmt).fetchall()
    
    return [
        {
            "id": r[0],
            "slug": r[1],
            "title": r[2],
            "description": r[3],
            "content": r[4],
            "sort_order": r[5]
        } for r in results
    ]

@router.get("/{slug}")
def get_service_by_slug(slug: str, db: Session = Depends(get_db)):
    """
    Get a specific service by slug.
    """
    stmt = text("SELECT id::text, slug, title, description, content, sort_order FROM services WHERE slug = :slug")
    result = db.execute(stmt, {"slug": slug}).fetchone()
    
    if not result:
        return {"error": "Service not found"}
        
    return {
        "id": result[0],
        "slug": result[1],
        "title": result[2],
        "description": result[3],
        "content": result[4],
        "sort_order": result[5]
    }
