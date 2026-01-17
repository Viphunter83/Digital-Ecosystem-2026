from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DECIMAL, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector
import uuid

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text)
    specs = Column(JSONB)
    price = Column(DECIMAL)
    currency = Column(String, default="RUB")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    images = relationship("ProductImage", back_populates="product")
    documents = relationship("Document", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True)
    title = Column(String)
    content = Column(Text)
    metadata_ = Column("metadata", JSONB) # 'metadata' is reserved in Base in some versions, using metadata_ with name mapping
    embedding = Column(Vector(1536))

    product = relationship("Product", back_populates="documents")
