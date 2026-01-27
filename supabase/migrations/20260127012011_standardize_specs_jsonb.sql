-- Standardize specs field to JSONB for better performance and indexing
-- This migration cast text back to JSONB, wrapping plain text into a JSON object if necessary to prevent errors.

ALTER TABLE products 
ALTER COLUMN specs TYPE JSONB 
USING (
    CASE 
        WHEN specs IS NULL THEN NULL
        WHEN specs = '' THEN '{}'::jsonb
        WHEN specs ~ '^\s*\{.*\}\s*$' OR specs ~ '^\s*\[.*\]\s*$' THEN specs::jsonb
        ELSE jsonb_build_object('raw_text', specs)
    END
);

ALTER TABLE spare_parts 
ALTER COLUMN specs TYPE JSONB 
USING (
    CASE 
        WHEN specs IS NULL THEN NULL
        WHEN specs = '' THEN '{}'::jsonb
        WHEN specs ~ '^\s*\{.*\}\s*$' OR specs ~ '^\s*\[.*\]\s*$' THEN specs::jsonb
        ELSE jsonb_build_object('raw_text', specs)
    END
);
