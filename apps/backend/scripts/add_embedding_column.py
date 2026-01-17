import logging
import sys
import os
from sqlalchemy import text

# Ensure apps module is found
sys.path.append(os.getcwd())

from apps.backend.app.core.database import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_embedding_column():
    db = SessionLocal()
    try:
        logger.info("Adding embedding column to products table if not exists...")
        # Check if column exists
        check_query = text("SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='embedding';")
        result = db.execute(check_query).fetchone()
        
        if not result:
            logger.info("Column embedding not found. Adding...")
            # Add column
            db.execute(text("ALTER TABLE products ADD COLUMN embedding vector(1536);"))
            db.commit()
            logger.info("Successfully added embedding column.")
        else:
            logger.info("Column embedding already exists.")

    except Exception as e:
        logger.error(f"Error adding column: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_embedding_column()
