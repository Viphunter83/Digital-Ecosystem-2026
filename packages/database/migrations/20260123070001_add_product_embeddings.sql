-- Migration: Add embedding column to products table
-- Timestamp: 20260123070001

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Optional: Create index for faster semantic search
CREATE INDEX IF NOT EXISTS products_embedding_idx ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
