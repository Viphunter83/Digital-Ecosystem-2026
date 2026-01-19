
import asyncio
import logging
import os
import sys
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete
from dotenv import load_dotenv

sys.path.append(os.getcwd())
from packages.database.models import Product, ProductImage

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

async def clean_junk_v2():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if "localhost" in db_url:
        db_url = db_url.replace("localhost", "127.0.0.1")
    
    engine = create_async_engine(db_url.replace("postgresql://", "postgresql+asyncpg://"))
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    # Load Report
    try:
        with open("audit_report_v2.json", "r", encoding="utf-8") as f:
            report = json.load(f)
    except FileNotFoundError:
        logger.error("audit_report_v2.json not found!")
        return

    junk_ids = [item["id"] for item in report["junk_candidates"]]

    if not junk_ids:
        logger.info("No junk candidates to remove.")
        return

    async with async_session() as session:
        logger.info(f"Removing {len(junk_ids)} confirmed junk items...")
        
        # 1. Delete associated images first
        img_query = delete(ProductImage).where(ProductImage.product_id.in_(junk_ids))
        await session.execute(img_query)
        
        # 2. Delete products
        query = delete(Product).where(Product.id.in_(junk_ids))
        await session.execute(query)
        await session.commit()
    
    print("\n" + "="*40)
    print("🧹 CLEANING V2 SUMMARY")
    print("="*40)
    print(f"Removed Items:      {len(junk_ids)}")
    print("="*40)

if __name__ == "__main__":
    asyncio.run(clean_junk_v2())
