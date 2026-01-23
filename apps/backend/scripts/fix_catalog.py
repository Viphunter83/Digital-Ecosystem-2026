import asyncio
import logging
import os
import sys
import re
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
from dotenv import load_dotenv

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

JUNK_PREFIXES = [
    "ТД РусСтанкоСбыт - ",
    "ТД РУССтанкоСбыт - ",
    "ТД РусСтанкоСбыт",
    "ТД РУССтанкоСбыт",
    "Технические характеристики ",
    "Тех. характеристики: ",
]

# We filter out keys that are redundant or too long for card-like views
BAD_SPEC_KEYWORDS = [
    "DESCRIPTION", "MAIN", "ОСНОВН", "SUMMARY", "ОПИСАН", "MODEL", "МОДЕЛЬ"
]

async def fix_catalog():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    # Priority to env DATABASE_URL if provided (for local apple user)
    db_url = os.environ.get("DATABASE_URL", db_url)
    
    if not db_url:
        logger.error("DATABASE_URL not found")
        return

    if "localhost" in db_url:
        db_url = db_url.replace("localhost", "127.0.0.1")
    
    engine = create_async_engine(db_url.replace("postgresql://", "postgresql+asyncpg://"))
    
    stats = {"titles_fixed": 0, "specs_cleaned": 0, "descriptions_fixed": 0}

    async with engine.begin() as conn:
        logger.info("Starting Catalog Fixes (Raw SQL)...")
        
        # 1. Fetch Products
        result = await conn.execute(text("SELECT id, name, description, specs FROM products"))
        products = result.fetchall()
        
        for p_id, p_name, p_desc, p_specs in products:
            was_modified = False
            new_name = p_name
            new_desc = p_desc
            new_specs = p_specs

            # --- 1. Clean Name ---
            original_name = p_name
            for prefix in JUNK_PREFIXES:
                if prefix in new_name:
                    new_name = new_name.replace(prefix, "").strip()
            
            if new_name.startswith("- "):
                 new_name = new_name[2:].strip()
            
            if new_name != original_name:
                was_modified = True
                stats["titles_fixed"] += 1

            # --- 2. Clean Description ---
            if new_desc:
                original_desc = new_desc
                # If desc starts with name, remove it
                if new_desc.lower().startswith(new_name.lower()):
                    new_desc = new_desc[len(new_name):].strip()
                    # Remove leading separators
                    new_desc = re.sub(r'^[\s\.\,\-]+', '', new_desc)
                
                if new_desc != original_desc:
                    was_modified = True
                    stats["descriptions_fixed"] += 1

            # --- 3. Clean Specs ---
            if p_specs:
                if isinstance(p_specs, str):
                    try:
                        p_specs = json.loads(p_specs)
                    except:
                        p_specs = {}

                current_specs = p_specs
                filtered_specs = {}
                specs_changed = False
                
                for k, v in current_specs.items():
                    k_upper = k.upper()
                    if any(kw in k_upper for kw in BAD_SPEC_KEYWORDS):
                        specs_changed = True
                        continue
                    filtered_specs[k] = v
                
                if specs_changed:
                    new_specs = filtered_specs
                    was_modified = True
                    stats["specs_cleaned"] += 1
            
            if was_modified:
                await conn.execute(
                    text("UPDATE products SET name = :name, description = :desc, specs = :specs WHERE id = :id"),
                    {"name": new_name, "desc": new_desc, "specs": json.dumps(new_specs), "id": p_id}
                )
    
    print("\n" + "="*40)
    print("🛠 CATALOG FIX SUMMARY (DATABASE SYNC)")
    print("="*40)
    print(f"Titles Fixed:        {stats['titles_fixed']}")
    print(f"Descriptions Fixed:  {stats['descriptions_fixed']}")
    print(f"Specs Cleaned:       {stats['specs_cleaned']}")
    print("="*40)

if __name__ == "__main__":
    asyncio.run(fix_catalog())
