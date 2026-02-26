-- Migration: Add AmoCRM Settings Table
-- Description: Table for persistent storage of AmoCRM access and refresh tokens
-- Created at: 2026-02-10 09:20:00

CREATE TABLE IF NOT EXISTS amocrm_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for subdomain if we ever have multiple, though usually it's one
CREATE INDEX IF NOT EXISTS idx_amocrm_subdomain ON amocrm_settings(subdomain);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_amocrm_settings_updated_at ON amocrm_settings;
DROP TRIGGER IF EXISTS update_amocrm_settings_updated_at ON amocrm_settings;
CREATE TRIGGER update_amocrm_settings_updated_at
    BEFORE UPDATE ON amocrm_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
