-- Migration to fix slugs and missing categories
-- Date: 2026-01-27 06:51:32

-- 1. Make products.slug nullable to handle items without slugs (e.g. from Directus auto-creation or old data)
ALTER TABLE products ALTER COLUMN slug DROP NOT NULL;

-- 2. Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    filter_group VARCHAR NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Add embedding columns if they are missing (requires pgvector)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'embedding') THEN
            ALTER TABLE products ADD COLUMN embedding vector(1536);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spare_parts' AND column_name = 'embedding') THEN
            ALTER TABLE spare_parts ADD COLUMN embedding vector(1536);
        END IF;
    END IF;
END $$;
