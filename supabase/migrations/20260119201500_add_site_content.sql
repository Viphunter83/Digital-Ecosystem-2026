-- Up Migration
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR,
    type VARCHAR DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add index for key lookups
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);
