-- Migration: Add many-to-many relationship between products and spare parts
-- Created: 20260128083321
-- Description: Creates a junction table to link machines with their compatible spare parts.

CREATE TABLE IF NOT EXISTS product_compatible_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    spare_part_id UUID NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, spare_part_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_compatible_parts_product_id ON product_compatible_parts(product_id);
CREATE INDEX IF NOT EXISTS idx_product_compatible_parts_spare_part_id ON product_compatible_parts(spare_part_id);
