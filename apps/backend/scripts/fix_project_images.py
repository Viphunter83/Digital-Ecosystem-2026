import logging
import sys
import os

# Ensure apps module is found
sys.path.append(os.getcwd())

from sqlalchemy import select, update
from apps.backend.app.core.database import SessionLocal
from packages.database.models import Project

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_images():
    db = SessionLocal()
    try:
        logger.info("Updating project images...")
        projects = db.execute(select(Project)).scalars().all()
        
        updates = {
            "ЗиО-Подольск: Модернизация": "/images/backgrounds/bg_1.jpg",
            "Силовые Машины: Капремонт": "/images/backgrounds/bg_2.jpg",
            "МТЗ: Линия валов": "/images/backgrounds/bg_4.jpg"
        }
        
        count = 0
        for project in projects:
            if not project.raw_data:
                continue
            
            title = project.raw_data.get("title")
            if title in updates:
                new_data = dict(project.raw_data)
                new_data["image_url"] = updates[title]
                project.raw_data = new_data
                count += 1
        
        db.commit()
        logger.info(f"Updated {count} projects with images.")
        
    except Exception as e:
        logger.error(f"Error updating images: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_images()
