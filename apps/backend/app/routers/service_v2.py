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
    Get a specific service by slug, including its cases from the new table.
    """
    try:
        # 1. Fetch main service info
        stmt = text("SELECT id::text, slug, title, description, content, sort_order FROM services WHERE slug = :slug")
        result = db.execute(stmt, {"slug": slug}).fetchone()
        
        if not result:
            return {"error": "Service not found"}
        
        service_id = result[0]
        service_data = {
            "id": service_id,
            "slug": result[1],
            "title": result[2],
            "description": result[3],
            "content": result[4] or {},
            "sort_order": result[5]
        }

        # 2. Try to fetch cases from the new table
        try:
            cases_stmt = text("""
                SELECT model, problem, solution, result, 
                       COALESCE('/assets/' || image_file::text, image_url) as image_url,
                       sort_order
                FROM service_cases 
                WHERE service_id = :service_id 
                ORDER BY sort_order ASC
            """)
            cases_result = db.execute(cases_stmt, {"service_id": service_id}).fetchall()
            
            if cases_result:
                # If we have cases in the new table, they take precedence
                service_data["content"]["cases"] = [
                    {
                        "model": r[0],
                        "problem": r[1],
                        "solution": r[2],
                        "result": r[3],
                        "image_url": r[4],
                        "sort_order": r[5]
                    } for r in cases_result
                ]
        except Exception as e:
            # Fallback: if table doesn't exist yet, keep using JSON content
            pass
            
        return service_data
    except Exception as e:
        return {"error": str(e)}
