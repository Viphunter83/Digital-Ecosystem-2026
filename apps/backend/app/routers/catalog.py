from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from apps.backend.app.core.database import get_db
from apps.backend.app.core.cache import cache
from packages.database.models import Product, ProductImage, SparePart, SparePartImage, MachineInstance
from apps.backend.app.schemas import ProductSchema, SparePartSchema, MachineInstanceSchema

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
    category: Optional[str] = None,  # Filter by category
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Search products or spare parts.
    Returns { results: [], total: int }
    """
    total_count = 0

    # SPARE PARTS MODE
    if type == "spares":
        # Base query
        query = select(SparePart).where(SparePart.is_published == True)
        if q:
            query = query.where(SparePart.name.ilike(f"%{q}%"))
        
        # Count query
        count_stmt = select(func.count()).select_from(query.subquery())
        total_count = await run_in_threadpool(lambda: db.execute(count_stmt).scalar()) or 0

        # Pagination
        query = query.options(joinedload(SparePart.images)).limit(limit).offset(offset)
        
        # Async DB Execution
        results = await run_in_threadpool(lambda: db.execute(query).unique().scalars().all())
        return {
            "results": [SparePartSchema.model_validate(p) for p in results],
            "total": total_count
        }

    # MACHINES MODE (Default)
    if not q:
        query = select(Product).where(Product.is_published == True)
        
        # Apply category filter
        if category:
            query = query.where(Product.category == category)
        
        # Count
        count_stmt = select(func.count()).select_from(query.subquery())
        total_count = await run_in_threadpool(lambda: db.execute(count_stmt).scalar()) or 0

        # Data
        query = query.options(joinedload(Product.images)).limit(limit).offset(offset)
        
        # Async DB Execution
        results = await run_in_threadpool(lambda: db.execute(query).unique().scalars().all())
        return {
            "results": [ProductSchema.model_validate(p) for p in results],
            "total": total_count
        }

    # Check if this looks like a semantic query (e.g. > 1 word)
    # AI Search handles its own limiting (top N relevance). 
    # Pagination for AI search is tricky without re-running embedding. 
    # For now, we return Top Limit matches for AI.
    is_semantic = len(q.split()) > 1
    
    if is_semantic:
        try:
            ai_service = AIService()
            query_embedding = await ai_service.get_embedding(q)
            
            # Semantic search using cosine distance (<=> operator)
            distance_expr = Product.embedding.cosine_distance(query_embedding).label("distance")
            
            stmt = select(Product, distance_expr).options(
                joinedload(Product.images)
            ).where(Product.is_published == True).order_by(distance_expr).limit(limit).offset(offset) # Apply Limit/Offset to AI too?
            # AI search usually needs strict ordering. 
            # If we offset deep, relevance drops.
            
            # Execute and filter in python (Async DB)
            results = await run_in_threadpool(lambda: db.execute(stmt).unique().all())
            
            # Total count for AI is hard to guess without fetching all. 
            # We can assume limit+1 or something. 
            # Or simplified: AI results are finite.
            # Let's count matching rows locally? No.
            # For UX, we say total = len(results) if no pagination supported for semantic yet.
            # But let's try to support it. 
            
            filtered_products = []
            for product, dist in results:
                if dist < 0.6:
                    filtered_products.append(product)
            
            return {
                "results": [ProductSchema.model_validate(p) for p in filtered_products],
                "total": len(filtered_products) # Approximated for semantic
            }
            
        except Exception as e:
            print(f"Semantic search failed: {e}")
            pass
            
    # Minimal/Keyword search
    query = select(Product).where(Product.is_published == True)
    query = query.where(Product.name.ilike(f"%{q}%"))
    
    # Apply category filter
    if category:
        query = query.where(Product.category == category)
    
    # Count
    count_stmt = select(func.count()).select_from(query.subquery())
    total_count = await run_in_threadpool(lambda: db.execute(count_stmt).scalar()) or 0

    # Data
    query = query.options(joinedload(Product.images)).limit(limit).offset(offset)
    
    # Async DB Execution
    results = await run_in_threadpool(lambda: db.execute(query).unique().scalars().all())
    data = [ProductSchema.model_validate(p) for p in results]
    return {
        "results": data,
        "total": total_count
    }

@router.get("/instances/{serial_number}")
def get_instance_by_serial(serial_number: str, db: Session = Depends(get_db)):
    """
    Get a unique machine instance by serial number (for Digital Passport).
    """
    stmt = select(MachineInstance).options(
        joinedload(MachineInstance.product).joinedload(Product.images)
    ).where(MachineInstance.serial_number == serial_number)
    
    instance = db.execute(stmt).unique().scalar_one_or_none()
    if not instance:
        return {"error": "Instance not found"}
        
    return MachineInstanceSchema.model_validate(instance)

@router.get("/debug/migrations")
def debug_migrations(db: Session = Depends(get_db)):
    """
    DEBUG: List applied migrations.
    """
    from sqlalchemy import text
    try:
        results = db.execute(text("SELECT name FROM _migrations_history")).scalars().all()
        return {"applied": results}
    except Exception as e:
        return {"error": str(e)}

@router.get("/debug/instances")
def debug_instances(db: Session = Depends(get_db)):
    """
    DEBUG: List all serial numbers in the system.
    """
    stmt = select(MachineInstance.serial_number)
    results = db.execute(stmt).scalars().all()
    return {"instances": results}

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
