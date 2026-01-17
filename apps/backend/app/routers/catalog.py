from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from apps.backend.app.core.database import get_db
from packages.database.models import Product
from apps.backend.app.schemas import ProductSchema

router = APIRouter()

@router.get("/search")
def search_catalog(q: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Search products by name or description.
    """
    # Use joinedload to fetch images relation
    query = select(Product).options(joinedload(Product.images))
    if q:
        query = query.where(Product.name.ilike(f"%{q}%"))
    
    results = db.execute(query).unique().scalars().all()

    # Convert manually to ensure property computation happens if not using response_model
    data = [ProductSchema.model_validate(p) for p in results]
    return {"results": data}

@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    """
    Get a specific product by ID (UUID).
    """
    try:
        stmt = select(Product).options(joinedload(Product.images)).where(Product.id == product_id)
        product = db.execute(stmt).unique().scalar_one_or_none()
        if not product:
            return {"error": "Product not found"}
        return ProductSchema.model_validate(product)
    except Exception as e:
        return {"error": str(e)}
