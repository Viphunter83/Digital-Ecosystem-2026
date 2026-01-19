from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Dict, Any

from apps.backend.app.core.database import get_db
from packages.database.models import SiteContent

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
def get_site_content(db: Session = Depends(get_db)):
    """
    Get all site content as a key-value map.
    This allows the frontend to fetch all dynamic strings in one go.
    Example response:
    {
        "home_hero_title": "Welcome to Russtanko",
        "contact_email": "info@russtanko.ru"
    }
    """
    stmt = select(SiteContent)
    results = db.execute(stmt).scalars().all()
    
    content_map = {}
    for item in results:
        # If type is json, we might want to parse it, but for now let's return raw string 
        # or implement logic based on item.type if needed.
        # Directus usually stores JSON as JSON, but here 'value' is Text column.
        content_map[item.key] = item.value
        
    return content_map
