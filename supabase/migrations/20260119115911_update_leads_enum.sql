-- Up Migration
DO $$
BEGIN
    -- Create type if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
        CREATE TYPE lead_source AS ENUM ('bot', 'site', 'app', 'diagnostics', 'bot_order', 'diagnostics_widget');
    ELSE
        -- Add new values safely
        ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'bot_order';
        ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'diagnostics_widget';
    END IF;
END$$;

-- Create leads table if not exists (in case it was missing in previous migrations)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source lead_source NOT NULL,
    name VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    company VARCHAR,
    message TEXT,
    metadata JSONB,
    status VARCHAR DEFAULT 'new',
    amocrm_id VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
