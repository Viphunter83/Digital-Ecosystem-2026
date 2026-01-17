from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Optional

from apps.backend.app.core.database import get_db
from packages.database.models import Product

router = APIRouter()

@router.get("/search")
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
