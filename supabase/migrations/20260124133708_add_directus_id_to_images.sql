-- Migration: Add directus_id to image tables
-- Created: 20260124133708

ALTER TABLE product_images ADD COLUMN IF NOT EXISTS directus_id UUID;
ALTER TABLE spare_part_images ADD COLUMN IF NOT EXISTS directus_id UUID;

COMMENT ON COLUMN product_images.directus_id IS 'Directus file UUID for internal asset management';
COMMENT ON COLUMN spare_part_images.directus_id IS 'Directus file UUID for internal asset management';
