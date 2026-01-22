from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from apps.backend.app.core.database import get_db

router = APIRouter()

@router.get("/")
def get_services(db: Session = Depends(get_db)):
    """
    Get all published services.
    """
    try:
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
    except Exception as e:
        return {"error": str(e)}

@router.get("/{slug}")
def get_service_by_slug(slug: str, db: Session = Depends(get_db)):
    """
    Get a specific service by slug.
    """
    try:
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
    except Exception as e:
        return {"error": str(e)}
