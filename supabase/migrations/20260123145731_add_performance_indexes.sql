-- Migration: Add indexes for performance optimization
-- Description: Adds indexes to Product.slug, Lead.phone, and MachineInstance.serial_number

CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone);
CREATE INDEX IF NOT EXISTS idx_machine_instances_serial_number ON machine_instances (serial_number);
