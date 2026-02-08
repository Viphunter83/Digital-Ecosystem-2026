from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from apps.backend.app.core.database import get_db
from apps.backend.app.core.cache import cache, redis_client
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
    
    # Group by filter_group and track minimum sort_order for each group
    groups_map = {}
    group_min_sort = {}
    
    for cat in categories:
        g_name = cat.filter_group
        if g_name not in groups_map:
            groups_map[g_name] = []
            group_min_sort[g_name] = cat.sort_order if cat.sort_order is not None else 999
        
        # Update min sort order if current category has smaller one
        if cat.sort_order is not None and cat.sort_order < group_min_sort[g_name]:
            group_min_sort[g_name] = cat.sort_order
            
        groups_map[g_name].append(CategorySchema(
            name=cat.name,
            slug=cat.slug,
            filter_group=cat.filter_group
        ))
    
    # Sort groups by their minimum sort_order, then alphabetically as backup
    sorted_group_names = sorted(groups_map.keys(), key=lambda g: (group_min_sort[g], g))
    
    groups = []
    for g_name in sorted_group_names:
        groups.append(FilterGroupSchema(group=g_name, categories=groups_map[g_name]))
            
    return FiltersResponse(groups=groups)

@router.get("/search")
@cache(expire=60) # 1 minute cache for faster content updates
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
    
    # Resolve category slug to name once if it exists
    category_name = None
    if category:
        cat_obj = await run_in_threadpool(lambda: db.execute(select(Category).where(func.lower(Category.slug) == category.lower())).scalar_one_or_none())
        category_name = cat_obj.name if cat_obj else category

    # SPARE PARTS MODE
    if type == "spares":
        # 1. Keyword search
        kw_query = select(SparePart).where(SparePart.is_published == True)
        if q:
            kw_query = kw_query.where(SparePart.name.ilike(f"%{q}%"))
        if category_name:
            kw_query = kw_query.where(SparePart.category.ilike(category_name))
        
        kw_results = await run_in_threadpool(lambda: db.execute(kw_query.options(joinedload(SparePart.images))).unique().scalars().all())
        
        # 2. Semantic search
        semantic_results = []
        if q and len(q.split()) > 0:
            try:
                ai_service = AIService()
                # Query Expansion for better semantic matching
                expanded_q = await ai_service.expand_query(q)
                print(f"DEBUG: Expanded spare query '{q}' -> '{expanded_q}'")
                
                query_embedding = await ai_service.get_embedding(expanded_q)
                
                distance_expr = SparePart.embedding.cosine_distance(query_embedding).label("distance")
                sem_stmt = select(SparePart, distance_expr).options(
                    joinedload(SparePart.images)
                ).where(SparePart.is_published == True)
                
                if category_name:
                    sem_stmt = sem_stmt.where(SparePart.category.ilike(category_name))
                
                sem_stmt = sem_stmt.order_by(distance_expr).limit(limit)
                sem_raw = await run_in_threadpool(lambda: db.execute(sem_stmt).unique().all())
                
                for spare, dist in sem_raw:
                    if dist is not None and dist < 0.45: # Tightened threshold
                        semantic_results.append(spare)
            except Exception as e:
                print(f"Semantic search for spares failed: {e}")

        # 3. Merge and Deduplicate
        seen_ids = set()
        merged_results = []
        
        for p in kw_results:
            if p.id not in seen_ids:
                merged_results.append(p)
                seen_ids.add(p.id)
                
        for p in semantic_results:
            if p.id not in seen_ids:
                merged_results.append(p)
                seen_ids.add(p.id)
                
        total_count = len(merged_results)
        paged_results = merged_results[offset : offset + limit]

        return {
            "results": [SparePartSchema.model_validate(p) for p in paged_results],
            "total": total_count
        }

    # MACHINES MODE (Default)
    if not q:
        query = select(Product).where(Product.is_published == True)
        
        # Apply category filter
        if category_name:
            query = query.where(Product.category.ilike(category_name))
        
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

    # HYBRID SEARCH (MACHINES)
    # We combine Keyword match (ILIKE) and Semantic match (pgvector)
    
    # 1. Keyword search (always performed as it's fast and precise for model numbers)
    kw_query = select(Product).where(Product.is_published == True)
    if q:
        kw_query = kw_query.where(Product.name.ilike(f"%{q}%"))
    if category_name:
        kw_query = kw_query.where(Product.category.ilike(category_name))
    
    kw_results = await run_in_threadpool(lambda: db.execute(kw_query.options(joinedload(Product.images))).unique().scalars().all())
    
    # 2. Semantic search (if q is meaningful)
    semantic_results = []
    if q and len(q.split()) > 0:
        try:
            ai_service = AIService()
            # Query Expansion for better semantic matching
            expanded_q = await ai_service.expand_query(q)
            print(f"DEBUG: Expanded product query '{q}' -> '{expanded_q}'")
            
            query_embedding = await ai_service.get_embedding(expanded_q)
            
            distance_expr = Product.embedding.cosine_distance(query_embedding).label("distance")
            
            sem_stmt = select(Product, distance_expr).options(
                joinedload(Product.images)
            ).where(Product.is_published == True)
            
            if category_name:
                sem_stmt = sem_stmt.where(Product.category.ilike(category_name))
                
            sem_stmt = sem_stmt.order_by(distance_expr).limit(limit)
            
            sem_raw = await run_in_threadpool(lambda: db.execute(sem_stmt).unique().all())
            
            # Threshold for semantic relevance
            for product, dist in sem_raw:
                if dist is not None and dist < 0.45: # Tightened threshold
                    semantic_results.append(product)
                    
        except Exception as e:
            print(f"Semantic search failed: {e}")
            
    # 3. Merge and Deduplicate
    # Keyword results go first (more precise for specific models), then semantic (similar items)
    seen_ids = set()
    merged_results = []
    
    for p in kw_results:
        if p.id not in seen_ids:
            merged_results.append(p)
            seen_ids.add(p.id)
            
    for p in semantic_results:
        if p.id not in seen_ids:
            merged_results.append(p)
            seen_ids.add(p.id)
            
    total_count = len(merged_results)
    # Apply pagination to merged results
    paged_results = merged_results[offset : offset + limit]
    
    return {
        "results": [ProductSchema.model_validate(p) for p in paged_results],
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

@router.get("/instances-featured")
def get_featured_instance(db: Session = Depends(get_db)):
    """
    Get the most recently active machine instance for featured display on /service page.
    """
    # First try to find one in repair (most relevant for service page)
    stmt = select(MachineInstance).options(
        joinedload(MachineInstance.product).joinedload(Product.images)
    ).where(MachineInstance.status == 'repair').limit(1)
    
    instance = db.execute(stmt).unique().scalar_one_or_none()
    
    # Fallback to any instance
    if not instance:
        stmt = select(MachineInstance).options(
            joinedload(MachineInstance.product).joinedload(Product.images)
        ).limit(1)
        instance = db.execute(stmt).unique().scalar_one_or_none()
    
    if not instance:
        return {"error": "No instances available"}
        
    return MachineInstanceSchema.model_validate(instance)

from apps.backend.app.schemas import SparePartSchema

@router.get("/instances/{serial_number}/recommended-spares")
async def get_recommended_spares(serial_number: str, db: Session = Depends(get_db)):
    """
    Find recommended spare parts for a machine using semantic similarity.
    """
    from packages.database.models import SparePart
    
    # 1. Get Instance and Product
    stmt = select(MachineInstance).where(MachineInstance.serial_number == serial_number)
    instance = db.execute(stmt).scalar_one_or_none()
    if not instance:
        return {"error": "Instance not found"}
        
    product_stmt = select(Product).where(Product.id == instance.product_id)
    product = db.execute(product_stmt).scalar_one_or_none()
    
    # 2. Semantic Search if product has embedding
    if product and hasattr(product, 'embedding') and product.embedding is not None:
        try:
            # We use product embedding as a query for spares
            distance_expr = SparePart.embedding.cosine_distance(product.embedding).label("distance")
            spares_stmt = select(SparePart, distance_expr).order_by(distance_expr).limit(6)
            
            spares_raw = await run_in_threadpool(lambda: db.execute(spares_stmt).all())
            
            return [SparePartSchema.model_validate(s) for s, dist in spares_raw]
        except Exception as e:
            print(f"Recommended spares search failed: {e}")
            
    # Fallback: Get some default popular spares
    spares_stmt = select(SparePart).limit(6)
    spares = db.execute(spares_stmt).scalars().all()
    return [SparePartSchema.model_validate(s) for s in spares]


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

@router.get("/debug/migration-files")
def debug_migration_files():
    """
    DEBUG: List migration files present on disk.
    """
    path = "/app/packages/database/migrations"
    try:
        import os
        files = sorted(os.listdir(path))
        return {"files": files}
    except Exception as e:
        return {"error": str(e)}

@router.get("/debug/migration-content")
def debug_migration_content():
    """
    DEBUG: Read content of the first failing migration.
    """
    path = "/app/packages/database/migrations/20260122030737_update_contacts_info.sql"
    try:
        with open(path, "r") as f:
            return {"content": f.read()}
    except Exception as e:
        return {"error": str(e)}

@router.get("/debug/run-migrations")
def debug_run_migrations():
    """
    DEBUG: Manually trigger the migration script and return output.
    """
    from apps.backend.scripts.apply_migrations import apply_migrations
    try:
        import io
        import sys
        from contextlib import redirect_stdout, redirect_stderr
        
        f = io.StringIO()
        with redirect_stdout(f), redirect_stderr(f):
             apply_migrations()
        return {"output": f.getvalue()}
    except Exception as e:
        return {"error": str(e)}

@router.get("/debug/sql-check")
def debug_sql_check(db: Session = Depends(get_db)):
    """
    DEBUG: Direct SQL check for table existence and record count.
    """
    from sqlalchemy import text
    try:
        # Check table existence
        table_exists = db.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'machine_instances')")).scalar()
        
        # Check record count if table exists
        count = 0
        if table_exists:
            count = db.execute(text("SELECT COUNT(*) FROM machine_instances")).scalar()
            
        return {
            "table_exists": table_exists,
            "record_count": count
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/{id_or_slug}")
def get_product(id_or_slug: str, db: Session = Depends(get_db)):
    """
    Get a specific product or spare part by ID (UUID) or Slug.
    """
    import uuid
    is_uuid = False
    try:
        uid = uuid.UUID(id_or_slug)
        is_uuid = True
    except ValueError:
        pass

    # 1. Try Machines
    if is_uuid:
        stmt = select(Product).options(
            joinedload(Product.images),
            joinedload(Product.compatible_parts).joinedload(SparePart.images)
        ).where(Product.id == uid)
    else:
        stmt = select(Product).options(
            joinedload(Product.images),
            joinedload(Product.compatible_parts).joinedload(SparePart.images)
        ).where(Product.slug == id_or_slug)
    
    product = db.execute(stmt).unique().scalar_one_or_none()
    if product:
        return ProductSchema.model_validate(product)
            
    # 2. Try Spares
    if is_uuid:
        stmt = select(SparePart).options(
            joinedload(SparePart.images),
            joinedload(SparePart.compatible_products).joinedload(Product.images)
        ).where(SparePart.id == uid)
    else:
        stmt = select(SparePart).options(
            joinedload(SparePart.images),
            joinedload(SparePart.compatible_products).joinedload(Product.images)
        ).where(SparePart.slug == id_or_slug)
        
    spare = db.execute(stmt).unique().scalar_one_or_none()
    if spare:
        return SparePartSchema.model_validate(spare)

    return {"error": "Product not found"}

@router.post("/reindex/{product_id}")
async def reindex_product(product_id: str, db: Session = Depends(get_db)):
    """
    Triggered by Directus hook to update embeddings for a product.
    """
    try:
        stmt = select(Product).where(Product.id == product_id)
        product = await run_in_threadpool(lambda: db.execute(stmt).scalar_one_or_none())
        if not product:
            return {"error": "Product not found"}
            
        ai_service = AIService()
        specs = product.specs or {}
        if isinstance(specs, str):
            specs_str = specs
        elif isinstance(specs, dict):
            specs_str = ", ".join([f"{k}: {v}" for k, v in specs.items()])
        else:
            specs_str = str(specs)
        text_to_embed = f"{product.name} Category: {product.category}. Specs: {specs_str}. {product.description or ''}"
        
        embedding = await ai_service.get_embedding(text_to_embed)
        product.embedding = embedding
        
        await run_in_threadpool(lambda: db.commit())
        
        # Clear search cache to reflect changes immediately
        try:
            keys = await redis_client.keys("search_products:*")
            if keys:
                await redis_client.delete(*keys)
        except Exception as cache_err:
            print(f"Failed to clear cache during product reindex: {cache_err}")

        return {"status": "success", "message": f"Product {product_id} reindexed"}
    except Exception as e:
        return {"error": str(e)}

@router.post("/reindex-spare/{spare_id}")
async def reindex_spare(spare_id: str, db: Session = Depends(get_db)):
    """
    Triggered by Directus hook to update embeddings for a spare part.
    """
    try:
        stmt = select(SparePart).where(SparePart.id == spare_id)
        spare = await run_in_threadpool(lambda: db.execute(stmt).scalar_one_or_none())
        if not spare:
            return {"error": "Spare part not found"}
            
        ai_service = AIService()
        specs = spare.specs or {}
        if isinstance(specs, str):
            specs_str = specs
        elif isinstance(specs, dict):
            specs_str = ", ".join([f"{k}: {v}" for k, v in specs.items()])
        else:
            specs_str = str(specs)
        # Including description if available for better semantic matching
        text_to_embed = f"Spare Part: {spare.name}. Description: {spare.description or ''}. Specs: {specs_str}."
        
        embedding = await ai_service.get_embedding(text_to_embed)
        spare.embedding = embedding
        
        await run_in_threadpool(lambda: db.commit())

        # Clear search cache to reflect changes immediately
        try:
            keys = await redis_client.keys("search_products:*")
            if keys:
                await redis_client.delete(*keys)
        except Exception as cache_err:
            print(f"Failed to clear cache during spare reindex: {cache_err}")

        return {"status": "success", "message": f"Spare part {spare_id} reindexed"}
    except Exception as e:
        return {"error": str(e)}
