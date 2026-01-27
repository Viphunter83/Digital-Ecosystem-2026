-- Migration: Nuclear Cleanup
-- Created: 20260127210000
-- Description: Sets CASCADE on ALL related tables and performs the final cleanup.

DO $$
DECLARE
    r RECORD;
    target_tables TEXT[] := ARRAY['products', 'spare_parts', 'machine_instances', 'client_equipment', 'service_tickets', 'categories', 'product_images', 'spare_part_images'];
BEGIN
    -- 1. FIX ALL CONSTRAINTS POINTING TO OUR TARGET TABLES
    FOR r IN 
        SELECT 
            tc.table_name, 
            kcu.column_name, 
            tc.constraint_name,
            ccu.table_name AS referenced_table_name,
            ccu.column_name AS referenced_column_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public'
          AND ccu.table_name = ANY(target_tables)
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || 
                ' ADD CONSTRAINT ' || quote_ident(r.constraint_name) || 
                ' FOREIGN KEY (' || quote_ident(r.column_name) || 
                ') REFERENCES ' || quote_ident(r.referenced_table_name) || 
                '(' || quote_ident(r.referenced_column_name) || ') ON DELETE CASCADE';
    END LOOP;

    -- 2. PERFORM THE PRODUCT CLEANUP
    DELETE FROM products 
    WHERE id NOT IN (
        '00c8aa75-d9f1-44ed-8b6f-1f279945b332', -- Станок лентобандажировочный РТ5001
        '0113b153-9d65-42ca-9280-fc36e3d1711b', -- Станок токарно-накатной РТ30102
        'afbe4ab7-cf40-4fd1-98d7-5a7fd91df5bd', -- Станок токарно-накатной РТ917
        '1ab07b40-2540-4328-8c66-f9bea8f78c20'  -- Станки специального назначения (РЖД)
    );

    -- 3. CLEAN UP ORPHAN CATEGORIES
    DELETE FROM categories 
    WHERE name NOT IN (SELECT DISTINCT category FROM products WHERE category IS NOT NULL)
      AND name NOT ILIKE '%ЖД%'
      AND name NOT ILIKE '%Railway%';

END $$;
