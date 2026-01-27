-- Migration: Add CASCADE DELETE to machine_instances
-- Created: 20260127170447
-- Description: Fixes foreign key constraint on machine_instances to allow product deletion.

DO $$
BEGIN
    -- 1. Check if table and constraint exist, then replace with CASCADE
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'machine_instances') THEN
        ALTER TABLE machine_instances DROP CONSTRAINT IF EXISTS machine_instances_product_id_fkey;
        ALTER TABLE machine_instances 
          ADD CONSTRAINT machine_instances_product_id_fkey 
          FOREIGN KEY (product_id) 
          REFERENCES products(id) 
          ON DELETE CASCADE;
    END IF;
END $$;
