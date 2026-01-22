-- Migration: Update offices with actual contact information from tdrusstankosbyt.ru
-- Generated: 2026-01-22

-- Update existing office with actual contact details
UPDATE offices SET
    phone = '+7 (499) 390-85-04',
    email = 'zakaz@tdrusstankosbyt.ru',
    name = 'Главный офис ТД РУССтанкоСбыт'
WHERE id = 1;

-- Add website and working hours to the offices table if not exists
ALTER TABLE offices ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE offices ADD COLUMN IF NOT EXISTS working_hours TEXT;

-- Update with additional info
UPDATE offices SET
    website = 'https://tdrusstankosbyt.ru',
    working_hours = 'Пн-Пт: 9:00-18:00'
WHERE id = 1;

-- Add site_content entries for contacts page
INSERT INTO site_content (key, value_ru, value_en) VALUES
('contacts_title', 'Контакты', 'Contacts'),
('contacts_subtitle', 'Свяжитесь с нами для обсуждения ваших потребностей в промышленном оборудовании', 'Contact us to discuss your industrial equipment needs'),
('contacts_order_email', 'zakaz@tdrusstankosbyt.ru', 'zakaz@tdrusstankosbyt.ru'),
('contacts_phone', '+7 (499) 390-85-04', '+7 (499) 390-85-04'),
('contacts_working_hours', 'Понедельник — Пятница: 9:00 — 18:00', 'Monday — Friday: 9:00 AM — 6:00 PM'),
('company_name', 'ООО «ТД РУССтанко-Сбыт»', 'TD RUSStanko-Sbyt LLC')
ON CONFLICT (key) DO UPDATE SET
    value_ru = EXCLUDED.value_ru,
    value_en = EXCLUDED.value_en;
