
import logging
import sys
import os
from sqlalchemy import select, update

sys.path.append(os.getcwd())
from apps.backend.app.core.database import SessionLocal
from packages.database.models import Product, ProductImage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_milling_image():
    db = SessionLocal()
    try:
        # Find 6R12 product
        product = db.execute(select(Product).where(Product.slug == "6r12")).scalar_one_or_none()
        if product:
             logger.info(f"Updating image for {product.name}")
             
             # Update ProductImage
             # Check if existing images need update or add new
             
             # Delete old images
             db.execute(update(ProductImage).where(ProductImage.product_id == product.id).values(url="/images/products/product_milling.png"))
             
             db.commit()
             logger.info("Updated successfully")
        else:
             logger.warning("Product 6r12 not found")
             
    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_milling_image()
