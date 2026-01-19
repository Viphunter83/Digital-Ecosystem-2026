from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from apps.backend.app.core.database import get_db
from apps.backend.app.core.cache import cache
from packages.database.models import Product, ProductImage, SparePart, SparePartImage
from apps.backend.app.schemas import ProductSchema, SparePartSchema

from apps.backend.services.ai_service import AIService

router = APIRouter()

@router.get("/search")
@cache(expire=300) # 5 minutes cache
async def search_products(
    q: Optional[str] = None,
    type: str = "machines", # "machines" or "spares"
    db: Session = Depends(get_db)
):
    """
    Search products or spare parts.
    """
    # SPARE PARTS MODE
    if type == "spares":
        query = select(SparePart).options(joinedload(SparePart.images))
        if q:
            query = query.where(SparePart.name.ilike(f"%{q}%"))
        results = db.execute(query).unique().scalars().all()
        return {"results": [SparePartSchema.model_validate(p) for p in results]}

    # MACHINES MODE (Default)
    if not q:
        query = select(Product).options(joinedload(Product.images))
         # Ensure we only return published products
        query = query.where(Product.is_published == True)
        results = db.execute(query).unique().scalars().all()
        return {"results": [ProductSchema.model_validate(p) for p in results]}

    # Check if this looks like a semantic query (e.g. > 1 word)
    is_semantic = len(q.split()) > 1
    
    if is_semantic:
        try:
            ai_service = AIService()
            query_embedding = await ai_service.get_embedding(q)
            
            # Semantic search using cosine distance (<=> operator)
            distance_expr = Product.embedding.cosine_distance(query_embedding).label("distance")
            
            stmt = select(Product, distance_expr).options(
                joinedload(Product.images)
            ).where(Product.is_published == True).order_by(distance_expr).limit(10)
            
            # Execute and filter in python
            results = db.execute(stmt).unique().all()
            
            filtered_products = []
            for product, dist in results:
                if dist < 0.6:
                    filtered_products.append(product)
            
            return {"results": [ProductSchema.model_validate(p) for p in filtered_products]}
            
        except Exception as e:
            # Fallback to keyword search if AI fails
            print(f"Semantic search failed: {e}")
            pass
            
    # Minimal/Keyword search
    query = select(Product).options(joinedload(Product.images))
    query = query.where(Product.is_published == True)
    query = query.where(Product.name.ilike(f"%{q}%"))
    
    results = db.execute(query).unique().scalars().all()
    data = [ProductSchema.model_validate(p) for p in results]
    return {"results": data}

@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    """
    Get a specific product by ID (UUID).
    """
    try:
        # 1. Try Machines
        stmt = select(Product).options(joinedload(Product.images)).where(Product.id == product_id)
        product = db.execute(stmt).unique().scalar_one_or_none()
        if product:
            return ProductSchema.model_validate(product)
            
        # 2. Try Spares
        stmt = select(SparePart).options(joinedload(SparePart.images)).where(SparePart.id == product_id)
        spare = db.execute(stmt).unique().scalar_one_or_none()
        if spare:
            return SparePartSchema.model_validate(spare)

        return {"error": "Product not found"}
    except Exception as e:
        return {"error": str(e)}
