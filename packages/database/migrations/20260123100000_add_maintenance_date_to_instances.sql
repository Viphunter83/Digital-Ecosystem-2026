-- Migration: Add next_maintenance_date to machine_instances
-- Timestamp: 20260123100000

ALTER TABLE machine_instances 
ADD COLUMN IF NOT EXISTS next_maintenance_date TIMESTAMP WITH TIME ZONE;

-- Seed some dates for testing Phase 3 (30 days from now is ~2026-02-22)
UPDATE machine_instances 
SET next_maintenance_date = '2026-02-22 10:00:00+03'
WHERE serial_number = 'CNC-2026-X';
