
import asyncio
import json
import logging
import os
import re
import hashlib
import sys
from collections import defaultdict
from io import BytesIO

# Add project root
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from PIL import Image
from dotenv import load_dotenv

# Import models
from packages.database.models import Product, SparePart, ProductImage

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Constants
OUTPUT_REPORT = "audit_report.json"
IMAGES_DIR = "_scraped_images"

# Stop Words
COMPETITOR_KEYWORDS = ["StankoArtel", "СтанкоАртель", "Russtanko-Rzn", "avito", "prom.ru", "tdrusstankosbyt"]

# Regex for phones (Generic RU pattern check)
PHONE_REGEX = re.compile(r'(?:\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}')
EMAIL_REGEX = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')

async def audit_data():
    load_dotenv()
    
    db_url = os.getenv("DATABASE_URL")
    if "localhost" in db_url:
        db_url = db_url.replace("localhost", "127.0.0.1")
        
    engine = create_async_engine(db_url.replace("postgresql://", "postgresql+asyncpg://"))
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    report = defaultdict(list)
    stats = defaultdict(int)

    async with async_session() as session:
        # Fetch Products
        logger.info("Fetching products for audit...")
        result = await session.execute(select(Product))
        products = result.scalars().all()
        
        # Fetch SpareParts
        logger.info("Fetching spare parts for audit...")
        result_sp = await session.execute(select(SparePart))
        spare_parts = result_sp.scalars().all()
        
        all_items = list(products) + list(spare_parts)
        stats["total_items_checked"] = len(all_items)

        # 1. Competitor & PII Sanitization
        logger.info("Running Competitor & PII Sanity Check...")
        for item in all_items:
            issues = []
            text_blobs = [item.name, str(item.specs)]
            if hasattr(item, 'description') and item.description:
                text_blobs.append(item.description)
            
            combined_text = " ".join(text_blobs)
            combined_text_lower = combined_text.lower()

            for kw in COMPETITOR_KEYWORDS:
                if kw.lower() in combined_text_lower:
                    issues.append(f"Competitor branding found: {kw}")
            
            # PII
            phones = PHONE_REGEX.findall(combined_text)
            emails = EMAIL_REGEX.findall(combined_text)
            
            if phones:
                issues.append(f"Potential phone numbers found: {len(phones)}")
            if emails:
                 issues.append(f"Potential emails found: {len(emails)}")

            if issues:
                report[str(item.id)].append({"type": "branding_pii", "details": issues})
                stats["items_with_branding_pii"] += 1

        # 3. Data Completeness
        logger.info("Running Data Completeness Check...")
        for item in all_items:
            issues = []
            
            # Specs Check
            if item.specs:
                for k, v in item.specs.items():
                    if v is None or v == "" or v == "undefined" or v == "null":
                        issues.append(f"Empty spec value for '{k}'")
                    elif isinstance(v, str) and ("<" in v and ">" in v):
                        issues.append(f"HTML in spec value for '{k}'")
            else:
                 issues.append("Specs missing or empty")

            if hasattr(item, 'slug') and not item.slug:
                 issues.append("Missing slug")

            if issues:
                report[str(item.id)].append({"type": "completeness", "details": issues})
                stats["items_with_completeness_issues"] += 1

        # 2. Image Quality Gate
        # Fetch Image records
        logger.info("Running Image Quality Gate...")
        result_img = await session.execute(select(ProductImage))
        db_images = result_img.scalars().all()
        
        img_hashes = {}
        
        for img in db_images:
            local_path = os.path.join(IMAGES_DIR, os.path.basename(img.url))
            issues = []
            
            if not os.path.exists(local_path):
                # Try relative path if stored as relative
                local_path = img.url.lstrip('/')
                if not os.path.exists(local_path):
                     # Maybe full url?
                     local_path = os.path.join(IMAGES_DIR, os.path.basename(img.url.split('?')[0]))
            
            if os.path.exists(local_path):
                try:
                    with Image.open(local_path) as pil_img:
                        width, height = pil_img.size
                        
                        # Size Check
                        if width < 200 or height < 200:
                            issues.append(f"Small image: {width}x{height}")
                            stats["trash_icon"] += 1
                        
                        # Aspect Ratio
                        aspect = width / height
                        if aspect > 3 or aspect < 0.3:
                             issues.append(f"Extreme aspect ratio: {aspect:.2f}")
                             stats["trash_banner"] += 1
                        
                        # Duplicates via Hash
                        # Resize for faster hash
                        small = pil_img.resize((32, 32)).convert("L")
                        img_hash = hashlib.md5(small.tobytes()).hexdigest()
                        
                        if img_hash in img_hashes:
                            issues.append(f"Duplicate image (matches {img_hashes[img_hash]})")
                            stats["duplicate_images"] += 1
                        else:
                            img_hashes[img_hash] = str(img.id)
                            
                except Exception as e:
                    issues.append(f"Corrupt image file: {e}")
                    stats["corrupt_images"] += 1
            else:
                # File missing locally
                # issues.append(f"File missing locally: {local_path}")
                pass

            if issues:
                report[str(img.id)].append({"type": "image_quality", "details": issues})
                stats["bad_images"] += 1

    # Output Report
    with open(OUTPUT_REPORT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*40)
    print("📋 AUDIT SUMMARY")
    print("="*40)
    print(f"Total Items Checked: {stats['total_items_checked']}")
    print("-" * 20)
    print(f"🔴 Branding/PII Issues: {stats['items_with_branding_pii']}")
    print(f"🟡 Completeness Issues: {stats['items_with_completeness_issues']}")
    print("-" * 20)
    print(f"🖼 Image Issues:")
    print(f"   - Icons (<200px):    {stats['trash_icon']}")
    print(f"   - Banners (Ratio):   {stats['trash_banner']}")
    print(f"   - Duplicates:        {stats['duplicate_images']}")
    print(f"   - Corrupt:           {stats['corrupt_images']}")
    print("="*40)
    print(f"Detailed report saved to {OUTPUT_REPORT}")

if __name__ == "__main__":
    asyncio.run(audit_data())
