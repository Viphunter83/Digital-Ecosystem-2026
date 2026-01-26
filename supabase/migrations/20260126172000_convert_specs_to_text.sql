-- Migration: Convert specs to text
-- Created: 20260126172000
-- Description: Convert specs columns from JSON to TEXT to allow error-proof editing.

-- 1. Convert products.specs
ALTER TABLE products ALTER COLUMN specs TYPE text USING specs::text;

-- 2. Convert spare_parts.specs
ALTER TABLE spare_parts ALTER COLUMN specs TYPE text USING specs::text;
