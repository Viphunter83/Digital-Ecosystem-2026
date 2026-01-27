-- Migration: Add image_file relations to directus_files
-- Created: 20260127132000
-- Description: Add foreign key constraints to image_file columns to enable Directus UI relations.

-- 1. Products
ALTER TABLE products 
  DROP CONSTRAINT IF EXISTS products_image_file_fkey;

ALTER TABLE products 
  ADD CONSTRAINT products_image_file_fkey 
  FOREIGN KEY (image_file) 
  REFERENCES directus_files(id) 
  ON DELETE SET NULL;

-- 2. Spare Parts
ALTER TABLE spare_parts 
  DROP CONSTRAINT IF EXISTS spare_parts_image_file_fkey;

ALTER TABLE spare_parts 
  ADD CONSTRAINT spare_parts_image_file_fkey 
  FOREIGN KEY (image_file) 
  REFERENCES directus_files(id) 
  ON DELETE SET NULL;

-- 3. Articles
ALTER TABLE articles 
  DROP CONSTRAINT IF EXISTS articles_image_file_fkey;

ALTER TABLE articles 
  ADD CONSTRAINT articles_image_file_fkey 
  FOREIGN KEY (image_file) 
  REFERENCES directus_files(id) 
  ON DELETE SET NULL;
