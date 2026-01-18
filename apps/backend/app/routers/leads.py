from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from apps.backend.app.core.database import get_db
from packages.database.models import Lead, LeadSource
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

router = APIRouter()

class LeadCreate(BaseModel):
    source: str # bot, site
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    message: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

@router.post("/leads")
def create_lead(lead_in: LeadCreate, db: Session = Depends(get_db)):
    """
    Ingest a new lead from any source (Site/Bot).
    """
    try:
        new_lead = Lead(
            source=LeadSource(lead_in.source),
            name=lead_in.name,
            phone=lead_in.phone,
            email=lead_in.email,
            message=lead_in.message,
            metadata_=lead_in.meta,
            status="new"
        )
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)
        
        # TODO: Trigger background task to sync with AmoCRM
        # background_tasks.add_task(sync_to_amocrm, new_lead.id)
        
        return {"status": "ok", "lead_id": str(new_lead.id)}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid source")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
