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

from fastapi.concurrency import run_in_threadpool
from apps.backend.app.schemas import FiltersResponse, FilterGroupSchema, CategorySchema
from packages.database.models import Category

@router.get("/filters", response_model=FiltersResponse)
async def get_filters(db: Session = Depends(get_db)):
    """
    Get dynamic filters for catalog.
    """
    # Fetch all categories ordered by sort_order
    categories = await run_in_threadpool(lambda: db.execute(select(Category).order_by(Category.sort_order)).scalars().all())
    
    # Group by filter_group
    groups_map = {}
    for cat in categories:
        if cat.filter_group not in groups_map:
            groups_map[cat.filter_group] = []
        groups_map[cat.filter_group].append(CategorySchema(
            name=cat.name,
            slug=cat.slug,
            filter_group=cat.filter_group
        ))
    
    # Format response
    groups = []
    # Define group order manually or fetch from DB if we had Group table. 
    # For now: defined order in list.
    ordered_groups = ["МЕХАНООБРАБОТКА", "ПРОИЗВОДСТВО", "ОБОРУДОВАНИЕ"]
    
    for g_name in ordered_groups:
        if g_name in groups_map:
            groups.append(FilterGroupSchema(group=g_name, categories=groups_map[g_name]))
            
    return FiltersResponse(groups=groups)

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
        
        # Async DB Execution
        results = await run_in_threadpool(lambda: db.execute(query).unique().scalars().all())
        return {"results": [SparePartSchema.model_validate(p) for p in results]}

    # MACHINES MODE (Default)
    if not q:
        query = select(Product).options(joinedload(Product.images))
         # Ensure we only return published products
        query = query.where(Product.is_published == True)
        
        # Async DB Execution
        results = await run_in_threadpool(lambda: db.execute(query).unique().scalars().all())
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
            
            # Execute and filter in python (Async DB)
            results = await run_in_threadpool(lambda: db.execute(stmt).unique().all())
            
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
    
    # Async DB Execution
    results = await run_in_threadpool(lambda: db.execute(query).unique().scalars().all())
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
