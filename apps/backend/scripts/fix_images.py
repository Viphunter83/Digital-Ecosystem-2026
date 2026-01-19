
import logging
import sys
import os

# Ensure we can import from app
sys.path.append(os.getcwd())

from sqlalchemy import select, update
from apps.backend.app.core.database import SessionLocal
from packages.database.models import Product, ProductImage, Article

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_images():
    db = SessionLocal()
    try:
        # 1. Update Products
        mappings = {
            "1m63-cnc": "/images/products/product_cnc.png",
            "6r12": "/images/products/product_cnc.png",
            "p6330": "/images/products/product_press.png",
            "titan-2026": "/images/products/product_conveyor.png",
            "photon-l": "/images/products/product_laser.png"
        }

        for slug, url in mappings.items():
            product = db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()
            if product:
                logger.info(f"Updating Product {slug} -> {url}")
                # Update images table
                # First delete old images? Or update existing?
                # Let's check existing primary image
                stmt = select(ProductImage).where(ProductImage.product_id == product.id, ProductImage.is_primary == True)
                existing_img = db.execute(stmt).scalar_one_or_none()
                
                if existing_img:
                    existing_img.url = url
                else:
                    new_img = ProductImage(product_id=product.id, url=url, is_primary=True)
                    db.add(new_img)
        
        # 2. Update Articles
        article_mappings = {
            "how-to-choose-cnc-2026": "/images/blog/journal_robotics.png",
            "metalworking-trends-2026": "/images/blog/journal_steel.png"
        }
        
        for slug, url in article_mappings.items():
            logger.info(f"Updating Article {slug} -> {url}")
            stmt = update(Article).where(Article.slug == slug).values(cover_image=url)
            db.execute(stmt)

        db.commit()
        logger.info("Images updated successfully!")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_images()
