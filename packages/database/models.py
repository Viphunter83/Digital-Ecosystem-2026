from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DECIMAL, DateTime, func, BigInteger, ARRAY, Enum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector
import uuid
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    director = "director"
    engineer = "engineer"
    procurement = "procurement"

class LeadSource(str, enum.Enum):
    bot = "bot"
    site = "site"
    app = "app"
    diagnostics = "diagnostics"

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    manufacturer = Column(String, nullable=True)
    description = Column(Text)
    specs = Column(JSONB)
    price = Column(DECIMAL)
    currency = Column(String, default="RUB")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    embedding = Column(Vector(1536))

    images = relationship("ProductImage", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")

class SparePart(Base):
    __tablename__ = "spare_parts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    specs = Column(JSONB)
    price = Column(DECIMAL)
    # embedding = Column(Vector(1536))

class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    inn = Column(String, nullable=True)
    contact_info = Column(JSONB)

    projects = relationship("Project", back_populates="client")
    telegram_users = relationship("TelegramUser", back_populates="client")

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"))
    contract_number = Column(String)
    year = Column(Integer)
    contract_sum = Column(DECIMAL)
    description = Column(Text)
    region = Column(String)
    coordinates = Column(JSONB) # {lat: ..., lon: ...}
    raw_data = Column(JSONB)

    client = relationship("Client", back_populates="projects")

class Article(Base):
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True)
    content = Column(Text)
    tags = Column(ARRAY(String))
    cover_image = Column(String)
    # embedding = Column(Vector(1536))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ctas = relationship("ArticleCTA", back_populates="article")

class ArticleCTA(Base):
    __tablename__ = "article_ctas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"))
    text = Column(String)
    link = Column(String)

    article = relationship("Article", back_populates="ctas")

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    content = Column(Text)
    source_type = Column(String) # 'tech_proposal', 'manual', etc.
    metadata_ = Column("metadata", JSONB)
    # embedding = Column(Vector(1536))

class TelegramUser(Base):
    __tablename__ = "telegram_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tg_id = Column(BigInteger, unique=True, nullable=False)
    phone = Column(String)
    # Role-based architecture fields
    role = Column(Enum(UserRole, name='user_role'), nullable=True)
    company_name = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True)

    client = relationship("Client", back_populates="telegram_users")
    notifications = relationship("Notification", back_populates="user")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("telegram_users.id"))
    message = Column(Text)
    status = Column(String, default='pending')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("TelegramUser", back_populates="notifications")

class ClientEquipment(Base):
    __tablename__ = "client_equipment"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    
    serial_number = Column(String, unique=True)
    purchase_date = Column(DateTime)
    warranty_until = Column(DateTime)
    
    # Predictive Maintenance Fields
    last_maintenance_date = Column(DateTime)
    next_maintenance_date = Column(DateTime)
    usage_hours = Column(Integer, default=0) # Engine hours
    maintenance_interval_hours = Column(Integer, default=5000) # e.g. every 5000 hours

    client = relationship("Client", back_populates="equipment")
    product = relationship("Product")
    tickets = relationship("ServiceTicket", back_populates="equipment")

class ServiceTicket(Base):
    __tablename__ = "service_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String, unique=True) # e.g. REQ-2026-001
    
    equipment_id = Column(UUID(as_uuid=True), ForeignKey("client_equipment.id"), nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("telegram_users.id"))
    
    status = Column(String, default="new") # new, in_progress, resolved, closed
    priority = Column(String, default="medium") # low, medium, high, critical
    
    description = Column(Text)
    engineer_comment = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    equipment = relationship("ClientEquipment", back_populates="tickets")
    author = relationship("TelegramUser")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(Enum(LeadSource, name='lead_source'), nullable=False)
    
    # Contact Info
    name = Column(String)
    phone = Column(String)
    email = Column(String)
    company = Column(String)
    
    # Context
    message = Column(Text) # "Interested in 16K20"
    metadata_ = Column("metadata", JSONB) # {diagnostics_result: ...}
    
    # Sync Status
    status = Column(String, default="new") # new, synced, error
    amocrm_id = Column(String, nullable=True) # Deal ID in CRM
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Add back reference to Client
Client.equipment = relationship("ClientEquipment", back_populates="client")
