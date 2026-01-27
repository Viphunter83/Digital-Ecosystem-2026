-- Migration: Ultimate Cascade Fix
-- Created: 20260127161700
-- Description: Automatically finds and updates ALL foreign keys pointing to 'products' to use ON DELETE CASCADE.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. FIX ALL TABLES POINTING TO 'products'
    FOR r IN 
        SELECT 
            tc.table_name, 
            kcu.column_name, 
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'products'
          AND tc.table_schema = 'public'
    LOOP
        RAISE NOTICE 'Updating constraint % on table %', r.constraint_name, r.table_name;
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || 
                ' ADD CONSTRAINT ' || quote_ident(r.constraint_name) || 
                ' FOREIGN KEY (' || quote_ident(r.column_name) || 
                ') REFERENCES products(id) ON DELETE CASCADE';
    END LOOP;

    -- 2. FIX ALL TABLES POINTING TO 'client_equipment' (Chain reaction)
    FOR r IN 
        SELECT 
            tc.table_name, 
            kcu.column_name, 
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'client_equipment'
          AND tc.table_schema = 'public'
    LOOP
        RAISE NOTICE 'Updating constraint % on table %', r.constraint_name, r.table_name;
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || 
                ' ADD CONSTRAINT ' || quote_ident(r.constraint_name) || 
                ' FOREIGN KEY (' || quote_ident(r.column_name) || 
                ') REFERENCES client_equipment(id) ON DELETE CASCADE';
    END LOOP;

END $$;
