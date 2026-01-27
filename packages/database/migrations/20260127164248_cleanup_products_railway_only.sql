-- Migration: Product Catalog Cleanup (Railway Only)
-- Created: 20260127164248
-- Description: Deletes all products except those in 'Станки для ЖД отрасли' category that have descriptions.

-- 1. Mass delete products that don't match the criteria
-- Thanks to our previous migration, this will also CASCADE delete linked images and client_equipment records.

DELETE FROM products 
WHERE category != 'Станки для ЖД отрасли' 
   OR (category = 'Станки для ЖД отрасли' AND (description IS NULL OR length(description) < 50));

-- 2. Optional: Clean up empty categories (except the one we keep)
-- Only if they are actually empty and not the target one.
DELETE FROM categories 
WHERE id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL)
  AND name != 'Станки для ЖД отрасли';
