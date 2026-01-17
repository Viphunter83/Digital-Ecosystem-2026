import logging
import sys
import os

# Ensure apps module is found
sys.path.append(os.getcwd())

from sqlalchemy import select, delete
from apps.backend.app.core.database import SessionLocal
from packages.database.models import Product, ProductImage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_product_images():
    db = SessionLocal()
    try:
        logger.info("Fixing product images...")
        
        # 1. Clear existing bad images
        db.execute(delete(ProductImage))
        db.commit()
        logger.info("Cleared existing product images.")

        # 2. Get all products
        products = db.execute(select(Product)).scalars().all()
        
        # 3. Map slugs/names to existing public images
        # File list based on verification:
        # product_cnc.png, product_laser.png, product_press.png, product_3d_printer.png, product_conveyor.png
        
        image_map = {
            "1m63-cnc": "/images/product_cnc.png", # Токарный
            "6r12": "/images/product_laser.png", # Фрезерный (proxy)
            "p6330": "/images/product_press.png", # Пресс
            "titan-2026": "/images/product_3d_printer.png", # Портальный (proxy)
            "photon-l": "/images/product_laser.png" # Лазер
        }
        
        count = 0
        for product in products:
            if product.slug in image_map:
                img = ProductImage(
                    product_id=product.id,
                    url=image_map[product.slug],
                    is_primary=True
                )
                db.add(img)
                count += 1
                logger.info(f"Added image {image_map[product.slug]} to {product.slug}")
            else:
                 # Fallback for any others
                 img = ProductImage(
                    product_id=product.id,
                    url="/images/product_cnc.png",
                    is_primary=True
                )
                 db.add(img)
                 count += 1
                 logger.info(f"Added fallback image to {product.slug}")

        db.commit()
        logger.info(f"Successfully added images to {count} products.")

    except Exception as e:
        logger.error(f"Error fixing product images: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_product_images()
