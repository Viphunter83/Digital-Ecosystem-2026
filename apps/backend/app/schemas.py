from pydantic import BaseModel, computed_field, Field
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
    
    # We need to include raw_data so from_attributes picks it up, but exclude from output
    raw_data: Optional[Dict[str, Any]] = Field(default=None, exclude=True)

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

    @computed_field
    def image_url(self) -> Optional[str]:
        if hasattr(self, "raw_data") and self.raw_data:
            return self.raw_data.get("image_url")
        return None

    class Config:
        from_attributes = True

class ProductImageSchema(BaseModel):
    url: str
    is_primary: bool = False

    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    category: str
    specs: Optional[Dict[str, Any]] = None
    price: Optional[float] = None
    
    # Hidden field to load images from ORM
    images: List[ProductImageSchema] = Field(default=[], exclude=True)
    
    @computed_field
    def image_url(self) -> Optional[str]:
        if self.images:
            for img in self.images:
                if img.is_primary:
                    return img.url
            return self.images[0].url
        return None

    class Config:
        from_attributes = True

class ArticleSchema(BaseModel):
    id: UUID
    title: str
    content: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None
    
    @computed_field
    def image_url(self) -> Optional[str]:
        return self.cover_image

    @computed_field
    def summary(self) -> Optional[str]:
        if self.content:
            return self.content[:200] + "..."
        return None

    class Config:
        from_attributes = True
