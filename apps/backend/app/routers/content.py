from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Dict, Any, List
from pydantic import BaseModel

from apps.backend.app.core.database import get_db
from packages.database.models import SiteContent

router = APIRouter()

# Pydantic schemas
class SolutionSchema(BaseModel):
    id: str
    slug: str
    title: str
    description: str | None
    icon: str | None
    gradient: str | None
    link_url: str | None
    link_text: str | None

    class Config:
        from_attributes = True

class OfficeSchema(BaseModel):
    id: str
    name: str
    city: str | None
    region: str | None
    address: str | None
    phone: str | None
    email: str | None
    latitude: float | None
    longitude: float | None
    is_headquarters: bool
    description: str | None
    working_hours: str | None

    class Config:
        from_attributes = True

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
        content_map[item.key] = item.value
        
    return content_map

@router.get("/solutions", response_model=List[SolutionSchema])
def get_solutions(db: Session = Depends(get_db)):
    """
    Get all published solutions for the /solutions page.
    """
    from sqlalchemy import text
    stmt = text("""
        SELECT id::text, slug, title, description, icon, gradient, link_url, link_text
        FROM solutions
        WHERE is_published = true
        ORDER BY sort_order
    """)
    results = db.execute(stmt).fetchall()
    return [
        SolutionSchema(
            id=r[0], slug=r[1], title=r[2], description=r[3],
            icon=r[4], gradient=r[5], link_url=r[6], link_text=r[7]
        ) for r in results
    ]

@router.get("/offices", response_model=List[OfficeSchema])
def get_offices(db: Session = Depends(get_db)):
    """
    Get all published offices for the /contacts page.
    """
    from sqlalchemy import text
    stmt = text("""
        SELECT id::text, name, city, region, address, phone, email, 
               latitude, longitude, is_headquarters, description, working_hours
        FROM offices
        WHERE is_published = true
        ORDER BY sort_order
    """)
    results = db.execute(stmt).fetchall()
    return [
        OfficeSchema(
            id=r[0], name=r[1], city=r[2], region=r[3], address=r[4],
            phone=r[5], email=r[6], latitude=float(r[7]) if r[7] else None, 
            longitude=float(r[8]) if r[8] else None, is_headquarters=r[9],
            description=r[10], working_hours=r[11]
        ) for r in results
    ]

