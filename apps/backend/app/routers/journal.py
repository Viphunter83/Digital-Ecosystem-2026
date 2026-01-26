from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from apps.backend.app.core.database import get_db
from packages.database.models import Article
from apps.backend.app.schemas import ArticleSchema

router = APIRouter()

@router.get("")
def get_journal(db: Session = Depends(get_db)):
    """
    Get list of articles.
    """
    query = select(Article).order_by(Article.created_at.desc())
    results = db.execute(query).scalars().all()
    data = [ArticleSchema.model_validate(a) for a in results]
    return {"articles": data}

@router.get("/{id_or_slug}")
def get_article(id_or_slug: str, db: Session = Depends(get_db)):
    """
    Get article by ID or Slug.
    """
    import uuid
    article = None
    
    # 1. Try as UUID
    try:
        aid = uuid.UUID(id_or_slug)
        query = select(Article).where(Article.id == aid)
        article = db.execute(query).scalar_one_or_none()
    except ValueError:
        # Not a UUID, move to slug lookup
        pass

    # 2. Try as Slug
    if not article:
        query = select(Article).where(Article.slug == id_or_slug)
        article = db.execute(query).scalar_one_or_none()
    
    if not article:
        return {"error": "Article not found"}
        
    return ArticleSchema.model_validate(article)
