-- Migration: Recursive Cascade Cleanup (Service Tickets)
-- Created: 20260127171417
-- Description: Fixes deep dependency chain products -> client_equipment -> service_tickets.

DO $$
BEGIN
    -- 1. service_tickets -> client_equipment
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'service_tickets') THEN
        -- Standard naming from logs: service_tickets_equipment_id_fkey
        ALTER TABLE service_tickets DROP CONSTRAINT IF EXISTS service_tickets_equipment_id_fkey;
        ALTER TABLE service_tickets 
          ADD CONSTRAINT service_tickets_equipment_id_fkey 
          FOREIGN KEY (equipment_id) 
          REFERENCES client_equipment(id) 
          ON DELETE CASCADE;
    END IF;

    -- 2. Ensure clients -> projects (Optional but safe)
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'projects') THEN
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
        ALTER TABLE projects 
          ADD CONSTRAINT projects_client_id_fkey 
          FOREIGN KEY (client_id) 
          REFERENCES clients(id) 
          ON DELETE CASCADE;
    END IF;

END $$;
