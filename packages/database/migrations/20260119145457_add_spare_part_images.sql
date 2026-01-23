CREATE TABLE IF NOT EXISTS spare_part_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spare_part_id UUID NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    "order" INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_spare_part_images_spare_part_id ON spare_part_images(spare_part_id);
