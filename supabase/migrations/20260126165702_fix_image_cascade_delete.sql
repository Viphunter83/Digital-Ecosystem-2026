-- Migration: Fix image cascade delete
-- Created: 20260126165702
-- Description: Update foreign keys to use ON DELETE CASCADE to allow deleting products/parts with images.

-- 1. Fix product_images
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE product_images 
  ADD CONSTRAINT product_images_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES products(id) 
  ON DELETE CASCADE;

-- 2. Fix spare_part_images
ALTER TABLE spare_part_images DROP CONSTRAINT IF EXISTS spare_part_images_spare_part_id_fkey;
ALTER TABLE spare_part_images 
  ADD CONSTRAINT spare_part_images_spare_part_id_fkey 
  FOREIGN KEY (spare_part_id) 
  REFERENCES spare_parts(id) 
  ON DELETE CASCADE;
