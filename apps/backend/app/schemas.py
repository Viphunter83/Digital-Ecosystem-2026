from pydantic import BaseModel, computed_field, Field, ConfigDict
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from apps.backend.app.core.config import settings

class ClientSchema(BaseModel):
    name: str
    model_config = ConfigDict(from_attributes=True)

class ProjectSchema(BaseModel):
    id: UUID
    description: Optional[str] = None
    year: Optional[int] = None
    region: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None
    client: Optional[ClientSchema] = None
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
        if hasattr(self, "raw_data") and self.raw_data:
             return self.raw_data.get("title", "Project")
        return "Project"

    @computed_field
    def image_url(self) -> Optional[str]:
        if hasattr(self, "raw_data") and self.raw_data:
            return self.raw_data.get("image_url")
        return None

    model_config = ConfigDict(from_attributes=True)

class ProductImageSchema(BaseModel):
    url: str
    directus_id: Optional[UUID] = None
    image_file: Optional[UUID] = None
    is_primary: bool = False
    order: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)

class ProductSchema(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    specs: Optional[Any] = None
    price: Optional[float] = None
    currency: Optional[str] = "RUB"
    is_published: bool = True
    image_file: Optional[UUID] = Field(default=None, exclude=True)
    images: List[ProductImageSchema] = Field(default=[], exclude=True)
    
    @computed_field
    @property
    def image_url(self) -> Optional[str]:
        try:
            base_url = settings.DIRECTUS_URL.rstrip('/')
            if hasattr(self, "image_file") and self.image_file:
                return f"{base_url}/assets/{self.image_file}"
            if hasattr(self, "images") and self.images:
                img = next((i for i in self.images if i.is_primary), self.images[0])
                if img.directus_id: return f"{base_url}/assets/{img.directus_id}"
                if img.image_file: return f"{base_url}/assets/{img.image_file}"
                return img.url
        except Exception: pass
        return None

    model_config = ConfigDict(from_attributes=True)

class ArticleSchema(BaseModel):
    id: UUID
    title: str
    content: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    image_file: Optional[UUID] = Field(default=None, exclude=True)
    
    @computed_field
    def image_url(self) -> Optional[str]:
        if hasattr(self, "image_file") and self.image_file:
            base_url = settings.DIRECTUS_URL.rstrip('/')
            return f"{base_url}/assets/{self.image_file}"
        return self.cover_image

    @computed_field
    def summary(self) -> Optional[str]:
        if self.content: return self.content[:200] + "..."
        return None

    @computed_field
    def published_at(self) -> Optional[str]:
        if self.created_at: return self.created_at.isoformat()
        return None

    model_config = ConfigDict(from_attributes=True)

class SparePartImageSchema(BaseModel):
    url: str
    directus_id: Optional[UUID] = None
    image_file: Optional[UUID] = None
    is_primary: bool = False
    order: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)

class SparePartSchema(BaseModel):
    id: UUID
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    specs: Optional[Any] = None
    price: Optional[float] = None
    currency: Optional[str] = "RUB"
    is_published: bool = True
    image_file: Optional[UUID] = Field(default=None, exclude=True)
    images: List[SparePartImageSchema] = Field(default=[], exclude=True)
    
    @computed_field
    @property
    def image_url(self) -> Optional[str]:
        try:
            base_url = settings.DIRECTUS_URL.rstrip('/')
            if hasattr(self, "image_file") and self.image_file:
                return f"{base_url}/assets/{self.image_file}"
            if hasattr(self, "images") and self.images:
                img = next((i for i in self.images if i.is_primary), self.images[0])
                if img.directus_id: return f"{base_url}/assets/{img.directus_id}"
                if img.image_file: return f"{base_url}/assets/{img.image_file}"
                return img.url
        except Exception: pass
        return None

    model_config = ConfigDict(from_attributes=True)

class CategorySchema(BaseModel):
    name: str
    slug: str
    filter_group: str
    model_config = ConfigDict(from_attributes=True)

class FilterGroupSchema(BaseModel):
    group: str
    categories: List[CategorySchema]
    model_config = ConfigDict(from_attributes=True)

class FiltersResponse(BaseModel):
    groups: List[FilterGroupSchema]
    model_config = ConfigDict(from_attributes=True)

class MachineInstanceSchema(BaseModel):
    id: UUID
    serial_number: str
    inventory_number: Optional[str] = None
    status: str
    service_history: List[Dict[str, Any]] = []
    telemetry_summary: Dict[str, Any] = {}
    product: Optional[ProductSchema] = None
    next_maintenance_date: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
