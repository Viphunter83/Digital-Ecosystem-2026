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

import re
from apps.backend.app.core.config import settings

UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.I)

@router.get("/", response_model=Dict[str, Any])
def get_site_content(db: Session = Depends(get_db)):
    """
    Get all site content as a key-value map.
    Automatically resolves Directus file UUIDs to full URLs.
    """
    stmt = select(SiteContent)
    results = db.execute(stmt).scalars().all()
    
    content_map = {}
    for item in results:
        val = item.value
        # If value looks like a UUID and type is 'file', expand to full URL
        if val and item.type == "file" and UUID_PATTERN.match(val):
            val = f"{settings.DIRECTUS_URL.rstrip('/')}/assets/{val}"
        
        content_map[item.key] = val
        
    return content_map

class ContentUpdateSchema(BaseModel):
    key: str
    value: str

@router.post("/", response_model=Dict[str, str])
def update_site_content(update: ContentUpdateSchema, db: Session = Depends(get_db)):
    """
    Update or create a site content key-value pair.
    """
    stmt = select(SiteContent).where(SiteContent.key == update.key)
    item = db.execute(stmt).scalar_one_or_none()
    
    if item:
        item.value = update.value
    else:
        item = SiteContent(key=update.key, value=update.value)
        db.add(item)
    
    db.commit()
    return {"status": "ok", "key": update.key}

from fastapi import UploadFile, File
import shutil
import os

@router.post("/upload", response_model=Dict[str, str])
async def upload_site_file(
    key: str, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Upload a file and link it to a site content key.
    """
    upload_dir = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # URL to access the file
    file_url = f"/api/uploads/{file.filename}"
    
    # Update DB
    stmt = select(SiteContent).where(SiteContent.key == key)
    item = db.execute(stmt).scalar_one_or_none()
    
    if item:
        item.value = file_url
    else:
        item = SiteContent(key=key, value=file_url, type="file")
        db.add(item)
    
    db.commit()
    return {"status": "ok", "url": file_url, "key": key}

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

class ProductionSiteSchema(BaseModel):
    id: str
    site_number: int
    city: str
    description: str | None
    sort_order: int | None

    class Config:
        from_attributes = True

@router.get("/production-sites", response_model=List[ProductionSiteSchema])
def get_production_sites(db: Session = Depends(get_db)):
    """
    Get all production sites for the /company page.
    """
    from sqlalchemy import text
    stmt = text("""
        SELECT id::text, site_number, city, description, sort_order
        FROM production_sites
        WHERE is_active = true
        ORDER BY sort_order
    """)
    results = db.execute(stmt).fetchall()
    return [
        ProductionSiteSchema(
            id=r[0], site_number=r[1], city=r[2], 
            description=r[3], sort_order=r[4]
        ) for r in results
    ]
