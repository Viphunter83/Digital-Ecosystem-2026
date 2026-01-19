
import asyncio
import logging
import os
import sys
import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from dotenv import load_dotenv

sys.path.append(os.getcwd())
from packages.database.models import Product

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

JUNK_PREFIXES = [
    "ТД РусСтанкоСбыт - ",
    "ТД РУССтанкоСбыт - ",
    "ТД РусСтанкоСбыт",
    "ТД РУССтанкоСбыт",
    "Технические характеристики "
]

BAD_SPEC_KEYS = ["MAIN", "MODEL", "main", "model"]

async def fix_catalog():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if "localhost" in db_url:
        db_url = db_url.replace("localhost", "127.0.0.1")
    
    engine = create_async_engine(db_url.replace("postgresql://", "postgresql+asyncpg://"))
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    stats = {"titles_fixed": 0, "specs_cleaned": 0}

    async with async_session() as session:
        logger.info("Starting Catalog Fixes...")
        
        result = await session.execute(select(Product))
        products = result.scalars().all()
        
        for p in products:
            was_modified = False
            
            # 1. Clean Name
            original_name = p.name
            for prefix in JUNK_PREFIXES:
                if prefix in p.name:
                    p.name = p.name.replace(prefix, "").strip()
            
            # Remove leading non-alphanumeric if any (like "- ")
            current_name = p.name
            if current_name.startswith("- "):
                 p.name = current_name[2:].strip()
            
            if p.name != original_name:
                was_modified = True
                stats["titles_fixed"] += 1

            # 2. Clean Specs
            if p.specs:
                new_specs = {}
                specs_changed = False
                for k, v in p.specs.items():
                    # Check bad keys
                    if k in BAD_SPEC_KEYS:
                        specs_changed = True
                        continue
                    
                    # Optional: Check bad values?
                    new_specs[k] = v
                
                if specs_changed:
                    p.specs = new_specs
                    was_modified = True
                    stats["specs_cleaned"] += 1
            
            if was_modified:
                session.add(p)
        
        await session.commit()
    
    print("\n" + "="*40)
    print("🛠 CATALOG FIX SUMMARY")
    print("="*40)
    print(f"Titles Fixed:      {stats['titles_fixed']}")
    print(f"Specs Cleaned:     {stats['specs_cleaned']}")
    print("="*40)

if __name__ == "__main__":
    asyncio.run(fix_catalog())
