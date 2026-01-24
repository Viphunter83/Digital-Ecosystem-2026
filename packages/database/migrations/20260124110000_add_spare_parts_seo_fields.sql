-- Add SEO fields and slug to spare_parts
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Use pgvector for embeddings if it exists, otherwise it will stay as is (already exists in DB but we ensure it's functional)
-- Table already has 'embedding' as Vector(1536) from my previous check.
CREATE INDEX IF NOT EXISTS idx_spare_parts_slug ON spare_parts(slug);
