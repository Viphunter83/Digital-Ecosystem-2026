from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from apps.backend.app.core.database import get_db
from packages.database.models import Product
from apps.backend.app.schemas import ProductSchema

from apps.backend.services.ai_service import AIService
from packages.database.models import Product

router = APIRouter()

@router.get("/search")
async def search_catalog(q: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Search products by name or description.
    Hybrid search:
    - If query is short/specific -> keyword search.
    - If query is descriptive -> semantic search using embeddings.
    """
    if not q:
        query = select(Product).options(joinedload(Product.images))
        results = db.execute(query).unique().scalars().all()
        return {"results": [ProductSchema.model_validate(p) for p in results]}

    # Check if this looks like a semantic query (e.g. > 2 words or long)
    is_semantic = len(q.split()) > 2
    
    if is_semantic:
        try:
            ai_service = AIService()
            query_embedding = await ai_service.get_embedding(q)
            
            # Semantic search using cosine distance (<=> operator)
            # Order by distance ASC
            stmt = select(Product).options(joinedload(Product.images)).order_by(
                Product.embedding.cosine_distance(query_embedding)
            ).limit(10)
            
            results = db.execute(stmt).unique().scalars().all()
            return {"results": [ProductSchema.model_validate(p) for p in results]}
            
        except Exception as e:
            # Fallback to keyword search if AI fails
            print(f"Semantic search failed: {e}")
            pass
            
    # Minimal/Keyword search
    query = select(Product).options(joinedload(Product.images))
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
        stmt = select(Product).options(joinedload(Product.images)).where(Product.id == product_id)
        product = db.execute(stmt).unique().scalar_one_or_none()
        if not product:
            return {"error": "Product not found"}
        return ProductSchema.model_validate(product)
    except Exception as e:
        return {"error": str(e)}
