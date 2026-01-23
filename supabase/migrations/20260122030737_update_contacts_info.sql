-- Migration: Update contacts info via site_content
-- Fixed: 2026-01-23 - Made idempotent, removed dependency on offices table

-- Add site_content entries for contacts page (key contact info only)
INSERT INTO site_content (key, value) VALUES
('contacts_title', 'Контакты'),
('contacts_subtitle', 'Свяжитесь с нами для обсуждения ваших потребностей в промышленном оборудовании'),
('contacts_order_email', 'zakaz@tdrusstankosbyt.ru'),
('contacts_phone', '+7 (499) 390-85-04'),
('contacts_working_hours', 'Понедельник — Пятница: 9:00 — 18:00'),
('company_name', 'ООО «ТД РУССтанко-Сбыт»'),
('company_website', 'https://tdrusstankosbyt.ru')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value;
