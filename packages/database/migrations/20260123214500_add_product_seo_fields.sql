-- Migration: Add SEO metadata fields to products
-- Created: 2026-01-23

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT;

COMMENT ON COLUMN products.meta_title IS 'SEO title tag override';
COMMENT ON COLUMN products.meta_description IS 'SEO meta description override';
