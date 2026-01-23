-- Up Migration
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL, -- Russian name: "Токарные станки"
    slug VARCHAR NOT NULL UNIQUE, -- Internal ID: "Turning" (matches Product.category)
    filter_group VARCHAR NOT NULL, -- "МЕХАНООБРАБОТКА", "ПРОИЗВОДСТВО"
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_group ON categories(filter_group);

-- Seed Data (Default Mapping from Frontend)
INSERT INTO categories (name, slug, filter_group, sort_order) VALUES
-- МЕХАНООБРАБОТКА
('Токарные станки', 'Turning', 'МЕХАНООБРАБОТКА', 10),
('Фрезерные станки', 'Milling', 'МЕХАНООБРАБОТКА', 20),
('Продвинутая обработка', 'Advanced Machining', 'МЕХАНООБРАБОТКА', 30),

-- ПРОИЗВОДСТВО
('Прессовое оборудование', 'Pressing', 'ПРОИЗВОДСТВО', 10),
('Лазерные станки', 'Laser', 'ПРОИЗВОДСТВО', 20),
('Листогибочное оборудование', 'Bending', 'ПРОИЗВОДСТВО', 30),

-- ОБОРУДОВАНИЕ (Catch-all or specialized misc?)
-- For now, let's map generic types if any. 
-- Or maybe 'Equipment' group extracts everything?
-- The frontend logic was: if (activeFilter === "ОБОРУДОВАНИЕ") return true; 
-- This implies "ОБОРУДОВАНИЕ" is maybe "ALL" or "Additional"?
-- Let's check frontend again. It had "ВСЕ", "МЕХАНООБРАБОТКА", "ПРОИЗВОДСТВО", "ОБОРУДОВАНИЕ".
-- If "Equipment" is a specific subset, we need to know what. 
-- In the mock: return true.. wait, line 48: return true. 
-- So "ОБОРУДОВАНИЕ" in current frontend behaves like "ВСЕ" but filtered? 
-- Actually, the code says:
-- if (activeFilter === "ОБОРУДОВАНИЕ") return true;
-- So it acts as a Reset/All or maybe includes everything not in others?
-- Let's stick to explicit categories. For now we strictly define specific ones.
('Прочее оборудование', 'Machinery', 'ОБОРУДОВАНИЕ', 10);
