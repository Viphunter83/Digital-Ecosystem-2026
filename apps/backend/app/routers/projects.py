from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from typing import List

from apps.backend.app.core.database import get_db
from packages.database.models import Project
from apps.backend.app.schemas import ProjectSchema

router = APIRouter()

@router.get("", response_model=List[ProjectSchema])
def get_projects(db: Session = Depends(get_db)):
    """
    Get list of projects with client data.
    """
    query = select(Project).options(joinedload(Project.client)).order_by(Project.year.desc())
    results = db.execute(query).scalars().all()
    
    # Map raw_data title to schema if needed, but Pydantic computed field handles logic better if attributes match.
    # However, SQLAlchemy models don't auto-map 'raw_data["title"]' to 'title' field unless we do it in schema or transformer.
    # Our schema tries `raw_data.get("title")` but `raw_data` field needs to be on model.
    # Let's fix schema so generic `title` property works.
    # Actually, let's keep it simple: the Project model in DB (seed_demo) has `raw_data={"title": ...}`.
    # We need to ensure the schema alias works.
    
    return results

@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """
    Get a single project by ID.
    """
    query = select(Project).where(Project.id == project_id).options(joinedload(Project.client))
    result = db.execute(query).scalar_one_or_none()
    
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Project not found")
        
    return result
