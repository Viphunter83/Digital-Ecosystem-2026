import sys
import os
import logging
import re
from sqlalchemy import create_engine, select, update
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

sys.path.append(os.getcwd())
from packages.database.models import Product, SparePart

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

PREFIX_PATTERN = re.compile(r"^ТД РУССтанкоСбыт\s*-\s*", re.IGNORECASE)

def clean_name(name):
    if not name:
        return name
    # Remove prefix
    cleaned = PREFIX_PATTERN.sub("", name)
    # Capitalize first letter
    if cleaned:
        cleaned = cleaned[0].upper() + cleaned[1:]
    return cleaned

def run_clean():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found.")
        return

    if "postgresql+asyncpg" in db_url:
        db_url = db_url.replace("postgresql+asyncpg", "postgresql")
    
    if "localhost" in db_url:
        db_url = db_url.replace("localhost", "127.0.0.1")
    
    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        logger.info("Starting Name Cleaning...")
        
        # 1. Clean Products
        stmt = select(Product)
        products = session.execute(stmt).scalars().all()
        count = 0
        for p in products:
            new_name = clean_name(p.name)
            if new_name != p.name:
                p.name = new_name
                count += 1
        
        logger.info(f"Updated {count} Product names.")
        
        # 2. Clean Spare Parts
        stmt = select(SparePart)
        spares = session.execute(stmt).scalars().all()
        s_count = 0
        for s in spares:
            new_name = clean_name(s.name)
            if new_name != s.name:
                s.name = new_name
                s_count += 1
        
        logger.info(f"Updated {s_count} SparePart names.")

        session.commit()
        logger.info("Database committed successfully.")

    except Exception as e:
        logger.error(f"Error cleaning names: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    run_clean()
