# Database Schema Design

Target: PostgreSQL with `pgvector` extension.

## Tables

### `products` (Machines)
Core product information (Heavy Machinery).
- `id` (UUID, PK)
- `name` (VARCHAR)
- `slug` (VARCHAR, Unique)
- `category` (VARCHAR)
- `manufacturer` (VARCHAR, nullable)
- `description` (TEXT)
- `specs` (JSONB)
- `price` (DECIMAL)
- `currency` (VARCHAR, default 'RUB')
- `created_at` (TIMESTAMP)

### `spare_parts`
Consumables and parts.
- `id` (UUID, PK)
- `name` (VARCHAR)
- `specs` (JSONB)
- `price` (DECIMAL)
- `embedding` (VECTOR(1536))

### `clients`
- `id` (UUID, PK)
- `name` (VARCHAR)
- `inn` (VARCHAR, nullable)
- `contact_info` (JSONB)

### `projects` (Cases)
Replaces 'references'.
- `id` (UUID, PK)
- `client_id` (UUID, FK -> clients.id)
- `contract_number` (VARCHAR)
- `year` (INTEGER)
- `contract_sum` (DECIMAL)
- `description` (TEXT) - "Work Type"
- `region` (VARCHAR)
- `coordinates` (JSONB) - {lat: float, lon: float}
- `raw_data` (JSONB)

### `articles` (Engineering Journal)
- `id` (UUID, PK)
- `title` (VARCHAR)
- `slug` (VARCHAR, Unique)
- `content` (TEXT) - Markdown
- `tags` (ARRAY[VARCHAR])
- `cover_image` (VARCHAR)
- `embedding` (VECTOR(1536))

### `article_ctas`
- `id` (UUID, PK)
- `article_id` (UUID, FK -> articles.id)
- `text` (VARCHAR)
- `link` (VARCHAR)

### `documents` (Machine Knowledge Base)
- `id` (UUID, PK)
- `title` (VARCHAR)
- `content` (TEXT)
- `source_type` (VARCHAR) - e.g. 'tech_proposal', 'manual'
- `embedding` (VECTOR(1536))

### `telegram_users` (Service Assistant)
- `id` (UUID, PK)
- `tg_id` (BIGINT, Unique)
- `phone` (VARCHAR)
- `client_id` (UUID, FK -> clients.id)

### `notifications`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> telegram_users.id)
- `message` (TEXT)
- `status` (VARCHAR) - 'pending', 'sent'
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `notes` (TEXT)
- `status` (VARCHAR) - e.g., 'new', 'contacted', 'closed'.

## Indexes
- GIN index on `products.specs` for fast JSON searching.
- HNSW index on `documents.embedding` for vector similarity search.
