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

@router.get("/{article_id}")
def get_article(article_id: str, db: Session = Depends(get_db)):
    """
    Get article by ID.
    """
    import uuid
    try:
        aid = uuid.UUID(article_id)
    except ValueError:
        return {"error": "Invalid ID format"}

    query = select(Article).where(Article.id == aid)
    article = db.execute(query).scalar_one_or_none()
    
    if not article:
        return {"error": "Article not found"}
        
    return ArticleSchema.model_validate(article)
