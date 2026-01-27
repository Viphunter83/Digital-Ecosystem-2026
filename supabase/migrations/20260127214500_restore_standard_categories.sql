-- Migration: Restore Missing Standard Categories
-- Created: 20260127214500
-- Description: Restores standard categories that were accidentally deleted during catalog cleanup.

INSERT INTO categories (name, slug, filter_group, sort_order) VALUES
('Токарные станки', 'Turning', 'МЕХАНООБРАБОТКА', 10),
('Фрезерные станки', 'Milling', 'МЕХАНООБРАБОТКА', 20),
('Продвинутая обработка', 'Advanced Machining', 'МЕХАНООБРАБОТКА', 30),
('Прессовое оборудование', 'Pressing', 'ПРОИЗВОДСТВО', 10),
('Лазерные станки', 'Laser', 'ПРОИЗВОДСТВО', 20),
('Листогибочное оборудование', 'Bending', 'ПРОИЗВОДСТВО', 30),
('Прочее оборудование', 'Machinery', 'ОБОРУДОВАНИЕ', 10)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    filter_group = EXCLUDED.filter_group,
    sort_order = EXCLUDED.sort_order;
