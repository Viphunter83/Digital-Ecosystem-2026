# Database Schema Design

Target: PostgreSQL with `pgvector` extension.

## Tables

### `products`
Core product information.
- `id` (UUID, PK)
- `name` (VARCHAR)
- `slug` (VARCHAR, Unique)
- `category` (VARCHAR)
- `description` (TEXT)
- `specs` (JSONB) - Key-value pairs of technical specifications (e.g., {"power": "15kW", "weight": "1200kg"}).
- `price` (DECIMAL)
- `currency` (VARCHAR, default 'RUB')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `product_images`
- `id` (UUID, PK)
- `product_id` (UUID, FK -> products.id)
- `url` (VARCHAR)
- `is_primary` (BOOLEAN)
- `order` (INTEGER)

### `documents`
Stores parsed content from PDFs/Excel for RAG (Retrieval-Augmented Generation).
- `id` (UUID, PK)
- `product_id` (UUID, FK -> products.id, nullable)
- `title` (VARCHAR)
- `content` (TEXT)
- `metadata` (JSONB) - Source file, page number, etc.
- `embedding` (VECTOR(1536)) - For semantic search.

### `leads`
Potential customers.
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `notes` (TEXT)
- `status` (VARCHAR) - e.g., 'new', 'contacted', 'closed'.

## Indexes
- GIN index on `products.specs` for fast JSON searching.
- HNSW index on `documents.embedding` for vector similarity search.
