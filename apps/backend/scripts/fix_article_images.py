import sys
import os
from sqlalchemy import select

# Ensure apps module is found
sys.path.append(os.getcwd())

from apps.backend.app.core.database import SessionLocal
from packages.database.models import Article

def fix_articles():
    db = SessionLocal()
    
    # 1. Update CNC article
    # Find by title approximation
    cnc_article = db.execute(select(Article).where(Article.title.ilike("%Как выбрать ЧПУ%"))).scalar_one_or_none()
    if cnc_article:
        cnc_article.cover_image = "/images/journal_analytics.png"
        print(f"Updated {cnc_article.title} -> {cnc_article.cover_image}")

    # 2. Update Additive article
    additive_article = db.execute(select(Article).where(Article.title.ilike("%Тренды металлообработки%"))).scalar_one_or_none()
    if additive_article:
        # Using robotics or steel? Let's use steel for additive manufacturing context (metal)
        additive_article.cover_image = "/images/journal_steel.png"
        print(f"Updated {additive_article.title} -> {additive_article.cover_image}")

    db.commit()
    db.close()

if __name__ == "__main__":
    fix_articles()
