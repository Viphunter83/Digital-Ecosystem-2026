-- Migration: Add url column to product_images and spare_part_images
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS url VARCHAR(255) DEFAULT '';
ALTER TABLE spare_part_images ADD COLUMN IF NOT EXISTS url VARCHAR(255) DEFAULT '';

-- Ensure they are NOT NULL after setting defaults
ALTER TABLE product_images ALTER COLUMN url SET NOT NULL;
ALTER TABLE spare_part_images ALTER COLUMN url SET NOT NULL;
