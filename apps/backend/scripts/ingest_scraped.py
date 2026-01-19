
import asyncio
import json
import logging
import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from packages.database.models import Product, ProductImage, SparePart, Base


from dotenv import load_dotenv

# Load env vars from project root
load_dotenv(os.path.join(os.getcwd(), ".env"))

# Configuration
# Force 127.0.0.1 to avoid IPv6 resolution issues on Mac
default_db = "postgresql://postgres:postgres@127.0.0.1:5432/digital_ecosystem"
DATABASE_URL = os.getenv("DATABASE_URL", default_db).replace("localhost", "127.0.0.1")
INPUT_FILE = "scraped_data_v1.json"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def ingest_data():
    if not os.path.exists(INPUT_FILE):
        logger.error(f"File {INPUT_FILE} not found!")
        return

    logger.info(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    logger.info(f"Loaded {len(data)} items. Starting ingestion...")

    products_added = 0
    parts_added = 0
    errors = 0

    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
        'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }

    def slugify(text):
        text = text.lower()
        res = ""
        for char in text:
            res += translit_map.get(char, char)
        import re
        return re.sub(r'[^a-z0-9]+', '-', res).strip('-')

    for item in data:
        try:
            slug = item.get("slug")
            if not slug or slug == "":
                slug = slugify(item["name"])

            if item["type"] == "machine":
                # Check existence
                existing = db.query(Product).filter(Product.slug == slug).first()
                if existing:
                    logger.info(f"Skipping existing product: {slug}")
                    continue

                product = Product(
                    name=item["name"],
                    slug=slug,
                    category="Machine Tools", # Default category
                    manufacturer="Unknown", # Could be parsed from specs
                    description=item["description"],
                    specs=item["specs"],
                    price=0, # Price usually requires request
                    currency="RUB"
                )
                db.add(product)
                db.flush() # Get ID

                # Images
                for idx, img_path in enumerate(item.get("images", [])):
                    # Construct public URL (assuming images are served from /images/)
                    # Convert local path to web path
                    # We need to move images to public folder? 
                    # For now just store the path relative to scraped folder
                    # In real app, we should move them to apps/frontend/public/images/products
                    
                    # Store as valid URL path for frontend
                    web_url = f"/images/products/{img_path}" 
                    
                    image = ProductImage(
                        product_id=product.id,
                        url=web_url,
                        is_primary=(idx == 0),
                        order=idx
                    )
                    db.add(image)
                
                products_added += 1

            elif item["type"] == "spare_part":
                 # Check existence
                existing = db.query(SparePart).filter(SparePart.name == item["name"]).first() # Spare parts dont have slugs in current model?
                if existing:
                    continue

                part = SparePart(
                    name=item["name"],
                    specs=item["specs"],
                    price=0
                )
                db.add(part)
                parts_added += 1

        except Exception as e:
            logger.error(f"Error ingesting {item.get('name')}: {e}")
            db.rollback()
            errors += 1
            continue
    
    db.commit()
    logger.info(f"Ingestion Complete.")
    logger.info(f"Products: {products_added}")
    logger.info(f"Spare Parts: {parts_added}")
    logger.info(f"Errors: {errors}")
    db.close()

if __name__ == "__main__":
    ingest_data()
