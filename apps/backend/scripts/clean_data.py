
import asyncio
import json
import logging
import os
import re
import sys
import uuid
from collections import defaultdict

# Add project root
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update, delete
from dotenv import load_dotenv

# Import models
# Ensure models have is_published (added via migration + models.py update)
from packages.database.models import Product, SparePart, ProductImage

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

INPUT_REPORT = "audit_report.json"
PLACEHOLDER_IMG = "/uploads/placeholder_russtanko.jpg"

# Sanitization Config
SENSITIVE_REPLACEMENT = "[Контакты скрыты, обратитесь к менеджеру]"
TRASH_KEYWORDS = ["Small image", "Extreme aspect ratio", "Entropy"]
COMPETITOR_MAP = {
    "StankoArtel": "ТД РусСтанкоСбыт",
    "СтанкоАртель": "ТД РусСтанкоСбыт",
    "Russtanko-Rzn": "ТД РусСтанкоСбыт",
    "avito": "",
    "prom.ru": ""
}
PHONE_REGEX = re.compile(r'(?:\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}')
EMAIL_REGEX = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')

async def clean_data():
    load_dotenv()
    
    if not os.path.exists(INPUT_REPORT):
        logger.error(f"Report {INPUT_REPORT} not found.")
        return

    with open(INPUT_REPORT, "r", encoding="utf-8") as f:
        report = json.load(f)

    db_url = os.getenv("DATABASE_URL")
    if "localhost" in db_url:
        db_url = db_url.replace("localhost", "127.0.0.1")
        
    engine = create_async_engine(db_url.replace("postgresql://", "postgresql+asyncpg://"))
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    stats = defaultdict(int)

    async with async_session() as session:
        logger.info("Starting Data Cleaning Process...")
        
        for item_id_str, issues in report.items():
            try:
                item_uuid = uuid.UUID(item_id_str)
            except ValueError:
                continue

            for issue in issues:
                issue_type = issue.get("type")
                details = issue.get("details", [])

                # -----------------------
                # Task 1: Image Hygiene
                # -----------------------
                if issue_type == "image_quality":
                    # Check if it's trash or duplicate
                    is_trash = any(any(tk in d for tk in TRASH_KEYWORDS) for d in details)
                    is_duplicate = any("Duplicate image" in d for d in details)
                    
                    if is_trash or is_duplicate:
                        # Attempt to delete ProductImage
                        # Note: The ID in the report for image_quality IS the ProductImage ID (from audit_data.py logic)
                        result = await session.execute(select(ProductImage).where(ProductImage.id == item_uuid))
                        img_obj = result.scalar_one_or_none()
                        
                        if img_obj:
                            await session.delete(img_obj)
                            stats["trash_images_removed"] += 1
                            
                            # Check remaining images for parent product
                            # This is complex because we just deleted one, session not committed yet?
                            # We'll handle placeholder logic separately or optimistically.
                            # Proper way: Check product's images count after deletion commit?
                            # For batch performance, let's just delete now and check placeholders in a second pass or safely skip.
                
                # -----------------------
                # Task 2: Competitor Sanitization
                # -----------------------
                elif issue_type == "branding_pii":
                    # Try Product then SparePart
                    result = await session.execute(select(Product).where(Product.id == item_uuid))
                    item = result.scalar_one_or_none()
                    if not item:
                         result = await session.execute(select(SparePart).where(SparePart.id == item_uuid))
                         item = result.scalar_one_or_none()
                    
                    if item:
                        was_modified = False
                        
                        # Sanitize Name
                        for bad, good in COMPETITOR_MAP.items():
                            if bad in item.name:
                                item.name = item.name.replace(bad, good)
                                was_modified = True

                        # Sanitize Description (only for products mostly)
                        if hasattr(item, "description") and item.description:
                             # Regex Phones/Emails
                             new_desc = PHONE_REGEX.sub(SENSITIVE_REPLACEMENT, item.description)
                             new_desc = EMAIL_REGEX.sub(SENSITIVE_REPLACEMENT, new_desc)
                             
                             # Competitor names
                             for bad, good in COMPETITOR_MAP.items():
                                 new_desc = new_desc.replace(bad, good)
                             
                             if new_desc != item.description:
                                 item.description = new_desc
                                 was_modified = True

                        if hasattr(item, "specs") and item.specs:
                             # Sanitize Specs Values (simple string check)
                             # Re-creating dict to trigger change detection if needed
                             new_specs = {}
                             specs_changed = False
                             for k, v in item.specs.items():
                                 if isinstance(v, str):
                                     new_v = v
                                     for bad, good in COMPETITOR_MAP.items():
                                         if bad in new_v:
                                             new_v = new_v.replace(bad, good)
                                     new_specs[k] = new_v
                                     if new_v != v:
                                         specs_changed = True
                                 else:
                                     new_specs[k] = v
                             
                             if specs_changed:
                                 item.specs = new_specs
                                 was_modified = True

                        if was_modified:
                            session.add(item)
                            stats["descriptions_sanitized"] += 1

                # -----------------------
                # Task 3: Quality Gate (Status)
                # -----------------------
                elif issue_type == "completeness":
                     result = await session.execute(select(Product).where(Product.id == item_uuid))
                     item = result.scalar_one_or_none()
                     if not item:
                          result = await session.execute(select(SparePart).where(SparePart.id == item_uuid))
                          item = result.scalar_one_or_none()
                     
                     if item:
                         if hasattr(item, "is_published"):
                             item.is_published = False
                             session.add(item)
                             stats["unpublished_incomplete"] += 1

        await session.commit()
    
    # -----------------------
    # Post-Cleaning: Placeholder Check
    # -----------------------
    # Check for products with 0 images
    async with async_session() as session:
        logger.info("Checking for products with no images...")
        # Get all products
        result = await session.execute(select(Product))
        products = result.scalars().all()
        
        # This is n+1 but safe for 400 products
        products_fixed = 0
        for p in products:
             # Refresh relationship if needed, or query images count
             # Since we are in async, standard lazy load fails. We need explicit load or query.
             # Let's query count.
             res_count = await session.execute(select(ProductImage).where(ProductImage.product_id == p.id))
             imgs = res_count.scalars().all() # scalar works for whole objects
             
             if not imgs:
                 # Create placeholder
                 logger.info(f"Adding placeholder for {p.name}")
                 new_img = ProductImage(
                     product_id=p.id,
                     url=PLACEHOLDER_IMG,
                     is_primary=True,
                     order=0
                 )
                 session.add(new_img)
                 products_fixed += 1
        
        await session.commit()
        stats["placeholders_added"] = products_fixed

    print("\n" + "="*40)
    print("🧹 CLEANING SUMMARY")
    print("="*40)
    print(f"Removed trash images:      {stats['trash_images_removed']}")
    print(f"Sanitized descriptions:    {stats['descriptions_sanitized']}")
    print(f"Unpublished incomplete:    {stats['unpublished_incomplete']}")
    print(f"Placeholders added:        {stats['placeholders_added']}")
    print("="*40)

if __name__ == "__main__":
    asyncio.run(clean_data())
