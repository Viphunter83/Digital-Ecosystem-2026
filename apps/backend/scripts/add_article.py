
import logging
import sys
import os

# Ensure we can import from app
sys.path.append(os.getcwd())

from sqlalchemy import select
from apps.backend.app.core.database import SessionLocal
from packages.database.models import Article

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_article():
    db = SessionLocal()
    try:
        articles_data = [
            {
                "title": "Предиктивная аналитика: Как избежать простоев?",
                "slug": "predictive-analytics-guide",
                "content": "Использование AI для мониторинга состояния оборудования позволяет сократить время простоя на 40%.",
                "tags": ["Analytics", "AI", "Maintenance"],
                "cover_image": "/images/blog/journal_analytics.png"
            }
        ]
        
        existing_slugs = db.execute(select(Article.slug)).scalars().all()
        
        for art in articles_data:
            if art["slug"] not in existing_slugs:
                logger.info(f"Adding Article: {art['slug']}")
                db.add(Article(**art))
            else:
                logger.info(f"Article {art['slug']} already exists.")
        
        db.commit()
        logger.info("Done!")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_article()
