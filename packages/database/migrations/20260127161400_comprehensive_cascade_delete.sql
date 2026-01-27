-- Migration: Robust Cascade Delete
-- Created: 20260127161800
-- Description: Ensures all relations are handled with ON DELETE CASCADE, checking for table existence.

DO $$
BEGIN
    -- 1. Products -> Images
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_images') THEN
        ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
        ALTER TABLE product_images 
          ADD CONSTRAINT product_images_product_id_fkey 
          FOREIGN KEY (product_id) 
          REFERENCES products(id) 
          ON DELETE CASCADE;
    END IF;

    -- 2. Products -> Client Equipment
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'client_equipment') THEN
        ALTER TABLE client_equipment DROP CONSTRAINT IF EXISTS client_equipment_product_id_fkey;
        ALTER TABLE client_equipment 
          ADD CONSTRAINT client_equipment_product_id_fkey 
          FOREIGN KEY (product_id) 
          REFERENCES products(id) 
          ON DELETE CASCADE;
    END IF;

    -- 3. Articles -> CTAs
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'article_ctas') THEN
        ALTER TABLE article_ctas DROP CONSTRAINT IF EXISTS article_ctas_article_id_fkey;
        ALTER TABLE article_ctas 
          ADD CONSTRAINT article_ctas_article_id_fkey 
          FOREIGN KEY (article_id) 
          REFERENCES articles(id) 
          ON DELETE CASCADE;
    END IF;

    -- 4. Spare Parts -> Images
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'spare_part_images') THEN
        ALTER TABLE spare_part_images DROP CONSTRAINT IF EXISTS spare_part_images_spare_part_id_fkey;
        ALTER TABLE spare_part_images 
          ADD CONSTRAINT spare_part_images_spare_part_id_fkey 
          FOREIGN KEY (spare_part_id) 
          REFERENCES spare_parts(id) 
          ON DELETE CASCADE;
    END IF;
END $$;
