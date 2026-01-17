import asyncio
import logging
import sys
import os
from sqlalchemy import select
from tqdm.asyncio import tqdm

# Ensure apps module is found
sys.path.append(os.getcwd())

from apps.backend.app.core.database import SessionLocal
from packages.database.models import Product
from apps.backend.services.ai_service import AIService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def generate_embeddings():
    db = SessionLocal()
    ai_service = AIService()
    
    try:
        logger.info("Fetching products without embeddings...")
        stmt = select(Product).where(Product.embedding.is_(None))
        products = db.execute(stmt).scalars().all()
        
        if not products:
            logger.info("No products found without embeddings.")
            return

        logger.info(f"Found {len(products)} products to process.")
        
        for product in tqdm(products, desc="Generating Embeddings"):
            # Construct text representation
            specs_str = ", ".join([f"{k}: {v}" for k, v in (product.specs or {}).items()])
            text_to_embed = f"{product.name} Category: {product.category}. Specs: {specs_str}. {product.description or ''}"
            
            try:
                embedding = await ai_service.get_embedding(text_to_embed)
                product.embedding = embedding
            except Exception as e:
                logger.error(f"Failed to generate embedding for {product.name}: {e}")
                continue
        
        db.commit()
        logger.info("Successfully updated embeddings.")

    except Exception as e:
        logger.error(f"Error in generate_embeddings: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(generate_embeddings())
