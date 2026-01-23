
import json
import logging
import os
import sys
import re

# Add project root to path
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configuration
INPUT_FILE = "scraped_data_v1.json"
DATABASE_URL = os.getenv("DATABASE_URL")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def normalize_name(name):
    if not name: return ""
    # Remove extra spaces and make lowercase
    return re.sub(r'[^a-zA-Z0-9а-яА-Я]+', '', name.lower())

def migrate_seo():
    if not os.path.exists(INPUT_FILE):
        logger.error(f"File {INPUT_FILE} not found!")
        return

    if not DATABASE_URL:
        logger.error("DATABASE_URL environment variable not set!")
        return

    logger.info(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    logger.info(f"Loaded {len(data)} items from JSON. Fetching products from DB...")
    
    # Get all products from DB for matching
    products = db.execute(text("SELECT id, name, slug FROM products")).all()
    db_products = {normalize_name(p.name): p.id for p in products}
    
    logger.info(f"Found {len(products)} products in DB.")

    updated_count = 0
    skipped_count = 0

    for item in data:
        name = item.get("name")
        norm_name = normalize_name(name)
        
        if norm_name in db_products:
            product_id = db_products[norm_name]
            meta_title = item.get("seo", {}).get("title", name)
            meta_description = item.get("description", "")
            
            # Limit meta_title length if necessary (usually 60-155 chars)
            if meta_title and len(meta_title) > 255:
                meta_title = meta_title[:252] + "..."
            
            db.execute(
                text("UPDATE products SET meta_title = :title, meta_description = :desc WHERE id = :id"),
                {"title": meta_title, "desc": meta_description, "id": product_id}
            )
            updated_count += 1
        else:
            skipped_count += 1

    db.commit()
    logger.info(f"Migration Complete.")
    logger.info(f"Updated: {updated_count}")
    logger.info(f"Skipped (no match): {skipped_count}")
    db.close()

if __name__ == "__main__":
    migrate_seo()
