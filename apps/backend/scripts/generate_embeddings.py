import asyncio
import logging
import sys
import os
from sqlalchemy import select
from tqdm.asyncio import tqdm
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ensure apps module is found
sys.path.append(os.getcwd())

from apps.backend.app.core.database import SessionLocal
from packages.database.models import Product, SparePart
from apps.backend.services.ai_service import AIService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_batch(db, ai_service, items, model_name):
    if not items:
        logger.info(f"No {model_name} found without embeddings.")
        return

    logger.info(f"Found {len(items)} {model_name} to process.")
    
    for item in tqdm(items, desc=f"Generating {model_name} Embeddings"):
        # Construct text representation
        specs = item.specs or {}
        if isinstance(specs, list):
            # Handle Directus repeater format [{key: ..., value: ...}]
            specs_str = ", ".join([f"{s.get('key')}: {s.get('value')}" for s in specs if isinstance(s, dict)])
        else:
            specs_str = ", ".join([f"{k}: {v}" for k, v in specs.items()])
            
        text_to_embed = f"{item.name} Category: {getattr(item, 'category', 'N/A')}. Specs: {specs_str}. {getattr(item, 'description', '')}"
        
        try:
            embedding = await ai_service.get_embedding(text_to_embed)
            item.embedding = embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding for {item.name}: {e}")
            continue
    
    db.commit()

async def generate_embeddings():
    db = SessionLocal()
    ai_service = AIService()
    
    try:
        # 1. Process Products
        logger.info("Fetching products without embeddings...")
        stmt_p = select(Product).where(Product.embedding.is_(None))
        products = db.execute(stmt_p).scalars().all()
        await process_batch(db, ai_service, products, "Products")

        # 2. Process Spare Parts
        logger.info("Fetching spare parts without embeddings...")
        stmt_s = select(SparePart).where(SparePart.embedding.is_(None))
        spares = db.execute(stmt_s).scalars().all()
        await process_batch(db, ai_service, spares, "Spare Parts")

        logger.info("Successfully updated all embeddings.")

    except Exception as e:
        logger.error(f"Error in generate_embeddings: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(generate_embeddings())
