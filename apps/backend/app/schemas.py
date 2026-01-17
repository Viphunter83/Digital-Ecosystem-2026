from pydantic import BaseModel, computed_field
from typing import Optional, Dict, Any, List
from uuid import UUID

class ClientSchema(BaseModel):
    name: str

class ProjectSchema(BaseModel):
    id: UUID

    description: Optional[str] = None
    year: Optional[int] = None
    region: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None
    client: Optional[ClientSchema] = None

    @computed_field
    def latitude(self) -> Optional[float]:
        if self.coordinates:
            return self.coordinates.get("lat")
        return None

    @computed_field
    def longitude(self) -> Optional[float]:
        if self.coordinates:
            return self.coordinates.get("lon")
        return None
    
    @computed_field
    def title(self) -> str:
        # Extract title from raw_data dict on the ORM object
        if hasattr(self, "raw_data") and self.raw_data:
             return self.raw_data.get("title", "Project")
        return "Project"

    class Config:
        from_attributes = True
