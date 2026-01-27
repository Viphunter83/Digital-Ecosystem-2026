-- Migration: Force Product Catalog Cleanup (Railway Only)
-- Created: 20260127165053
-- Description: Final attempt at cleaning up products with explicit IDs to keep.

-- 1. Delete all products EXCEPT the verified high-quality railway ones
DELETE FROM products 
WHERE id NOT IN (
    '00c8aa75-d9f1-44ed-8b6f-1f279945b332', -- Станок лентобандажировочный РТ5001
    '0113b153-9d65-42ca-9280-fc36e3d1711b', -- Станок токарно-накатной РТ30102
    'afbe4ab7-cf40-4fd1-98d7-5a7fd91df5bd', -- Станок токарно-накатной РТ917
    '1ab07b40-2540-4328-8c66-f9bea8f78c20'  -- Станки специального назначения (РЖД)
);

-- 2. Clean up empty categories (except the important ones)
DELETE FROM categories 
WHERE id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL)
  AND name NOT ILIKE '%ЖД%'
  AND name NOT ILIKE '%Railway%';

-- 3. Just in case, ensure no orphan spare parts or images remain
DELETE FROM spare_parts WHERE product_id NOT IN (SELECT id FROM products);
