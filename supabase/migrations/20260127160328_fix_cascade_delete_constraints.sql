-- Migration: Fix cascade delete for products and articles
-- Created: 20260127160328
-- Description: Ensures associated images and CTAs are deleted when a product or article is removed.

-- 1. product_images -> products
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE product_images 
  ADD CONSTRAINT product_images_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES products(id) 
  ON DELETE CASCADE;

-- 2. article_ctas -> articles
ALTER TABLE article_ctas DROP CONSTRAINT IF EXISTS article_ctas_article_id_fkey;
ALTER TABLE article_ctas 
  ADD CONSTRAINT article_ctas_article_id_fkey 
  FOREIGN KEY (article_id) 
  REFERENCES articles(id) 
  ON DELETE CASCADE;

-- 3. spare_part_images -> spare_parts (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'spare_part_images') THEN
        ALTER TABLE spare_part_images DROP CONSTRAINT IF EXISTS spare_part_images_spare_part_id_fkey;
        ALTER TABLE spare_part_images 
          ADD CONSTRAINT spare_part_images_spare_part_id_fkey 
          FOREIGN KEY (spare_part_id) 
          REFERENCES spare_parts(id) 
          ON DELETE CASCADE;
    END IF;
END $$;
