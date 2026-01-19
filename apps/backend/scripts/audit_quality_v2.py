
import asyncio
import logging
import os
import sys
import json
from collections import Counter
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, selectinload
from sqlalchemy import select, func
from dotenv import load_dotenv

sys.path.append(os.getcwd())
from packages.database.models import Product, ProductImage

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

JUNK_KEYWORDS = [
    "Каталоги", "Запасные части", "Производство", "Тендеры", 
    "Тематические статьи", "Техническая литература", 
    "Полезная информация", "О компании", "Новости", 
    "Job", "Vacancy", "Вакансии", "Partner",
    "Ремонт", "Модернизация", "Услуги"
]

async def run_audit():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if "localhost" in db_url:
        db_url = db_url.replace("localhost", "127.0.0.1")
    
    engine = create_async_engine(db_url.replace("postgresql://", "postgresql+asyncpg://"))
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    report = {
        "total_start": 0,
        "junk_candidates": [],
        "duplicates": [],
        "unique_products_count": 0,
        "image_stats": {
            "total_images": 0,
            "placeholders": 0,
            "unique_real_images": 0
        }
    }

    async with async_session() as session:
        logger.info("Starting Deep Audit...")
        
        # 1. Fetch All Products with Images
        query = select(Product).options(selectinload(Product.images))
        result = await session.execute(query)
        products = result.scalars().all()
        report["total_start"] = len(products)

        # 2. Analyze Junk
        for p in products:
            name_lower = p.name.lower() if p.name else ""
            for kw in JUNK_KEYWORDS:
                if kw.lower() in name_lower:
                    report["junk_candidates"].append({
                        "id": str(p.id),
                        "name": p.name,
                        "reason": f"Keyword: {kw}"
                    })
                    break
        
        # 3. Analyze Duplicates (Name Normalization)
        # We assume if name is identical (ignoring case/spaces), it's a duplicate
        name_map = {}
        for p in products:
            if not p.name: continue
            norm_name = " ".join(p.name.lower().split()) # Normalize whitespace
            if norm_name not in name_map:
                name_map[norm_name] = []
            name_map[norm_name].append(p)

        for name, group in name_map.items():
            if len(group) > 1:
                # Keep the one with most specs content or oldest/newest? 
                # For report, just list them
                ids = [str(p.id) for p in group]
                report["duplicates"].append({
                    "name": name,
                    "count": len(group),
                    "ids": ids
                })

        report["unique_products_count"] = len(name_map)

        # 4. Image Stats
        real_image_urls = set()
        for p in products:
            has_placeholder = False
            for img in p.images:
                report["image_stats"]["total_images"] += 1
                if "placeholder" in img.url or "no_image" in img.url:
                    report["image_stats"]["placeholders"] += 1
                    has_placeholder = True
                else:
                    real_image_urls.add(img.url)
            
            # If product has no images at all, it's effectively a placeholder case (handled by UI fallback)
            if not p.images:
                report["image_stats"]["placeholders"] += 1

        report["image_stats"]["unique_real_images"] = len(real_image_urls)

    # Save Report
    with open("audit_report_v2.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*40)
    print("📋 DEEP AUDIT SUMMARY")
    print("="*40)
    print(f"Total Products:     {report['total_start']}")
    print(f"Junk Candidates:    {len(report['junk_candidates'])}")
    print(f"Duplicate Groups:   {len(report['duplicates'])}")
    print(f"Real Unique Images: {report['image_stats']['unique_real_images']}")
    print("="*40)

if __name__ == "__main__":
    asyncio.run(run_audit())
