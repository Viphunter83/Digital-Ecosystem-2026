
import asyncio
import logging
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete
from dotenv import load_dotenv

sys.path.append(os.getcwd())
from packages.database.models import Product, SparePart

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

JUNK_KEYWORDS = [
    "НОВОСТИ", "Статья", "Технические характеристики", 
    "О компании", "Вакансии", "Kontakty", "Контакты",
    "News", "Articles"
]

async def remove_junk():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if "localhost" in db_url:
        db_url = db_url.replace("localhost", "127.0.0.1")
    
    engine = create_async_engine(db_url.replace("postgresql://", "postgresql+asyncpg://"))
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as session:
        logger.info("Starting Junk Removal...")
        
        deleted_count = 0
        
        # Scan Products
        result = await session.execute(select(Product))
        products = result.scalars().all()
        
        for p in products:
            is_junk = False
            # Check Name content
            if not p.name or len(p.name.strip()) < 3:
                is_junk = True
            
            for kw in JUNK_KEYWORDS:
                if kw.lower() in p.name.lower():
                    is_junk = True
                    break
            
            # Check Category (if suspicious) - optional
            
            if is_junk:
                logger.info(f"Removing Junk Product: {p.name} ({p.id})")
                await session.delete(p)
                deleted_count += 1
        
        await session.commit()
    
    print("\n" + "="*40)
    print("🗑 JUNK REMOVAL SUMMARY")
    print("="*40)
    print(f"Removed Items:      {deleted_count}")
    print("="*40)

if __name__ == "__main__":
    asyncio.run(remove_junk())
