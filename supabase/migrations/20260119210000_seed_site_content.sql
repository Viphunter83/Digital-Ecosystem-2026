-- Seed default site content
INSERT INTO site_content (key, value, description) VALUES
('contact_phone', '+7 (499) 390-85-04', 'Phone number displayed in footer'),
('contact_email', 'zakaz@tdrusstankosbyt.ru', 'Email address displayed in footer'),
('contact_address', 'Москва, Россия', 'Physical address displayed in footer'),
('social_telegram', 'https://t.me/tdrusstankosbyt', 'Telegram link'),
('ui_nav_catalog', 'Каталог', 'Navigation link label'),
('ui_nav_solutions', 'Решения', 'Navigation link label'),
('ui_nav_company', 'О компании', 'Navigation link label'),
('ui_nav_contacts', 'Контакты', 'Navigation link label'),
('ui_btn_request_cp', 'Запрос КП', 'Button label for Request Proposal'),
('ui_btn_order', 'ЗАКАЗ', 'Button label for Order'),
('ui_btn_search', 'ПОИСК', 'Button label for Search')
ON CONFLICT (key) DO NOTHING;
