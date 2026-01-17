-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    slug VARCHAR NOT NULL UNIQUE,
    category VARCHAR NOT NULL,
    manufacturer VARCHAR,
    description TEXT,
    specs JSONB,
    price DECIMAL,
    currency VARCHAR DEFAULT 'RUB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    url VARCHAR NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    "order" INTEGER DEFAULT 0
);

-- Spare Parts (Consumables)
CREATE TABLE spare_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    specs JSONB,
    price DECIMAL,
    embedding vector(1536)
);

-- Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    inn VARCHAR,
    contact_info JSONB
);

-- Projects (References)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    contract_number VARCHAR,
    year INTEGER,
    contract_sum DECIMAL,
    description TEXT,
    region VARCHAR,
    coordinates JSONB,
    raw_data JSONB
);

-- Articles (Engineering Journal)
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    slug VARCHAR UNIQUE,
    content TEXT,
    tags VARCHAR[],
    cover_image VARCHAR,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE article_ctas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id),
    text VARCHAR,
    link VARCHAR
);

-- Documents (RAG Knowledge Base)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR,
    content TEXT,
    source_type VARCHAR,
    metadata JSONB,
    embedding vector(1536)
);

-- Telegram Bot Users
CREATE TABLE telegram_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tg_id BIGINT UNIQUE NOT NULL,
    phone VARCHAR,
    client_id UUID REFERENCES clients(id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES telegram_users(id),
    message TEXT,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
