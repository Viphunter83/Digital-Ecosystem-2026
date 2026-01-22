-- Migration: Add company page and hero section content to site_content
-- Generated: 2026-01-22

-- Hero Section content by role
INSERT INTO site_content (key, value, description, type) VALUES
-- Default role
('default_title', 'ОБЕСПЕЧИВАЕМ БЕСПЕРЕБОЙНУЮ РАБОТУ СТАНОЧНОГО ПАРКА', 'Hero заголовок для default роли', 'text'),
('default_subtitle', 'Комплексные поставки металлообрабатывающего оборудования. Сервис, лизинг, цифровизация.', 'Hero подзаголовок для default роли', 'text'),
('default_cta', 'ЗАПУСТИТЬ ДИАГНОСТИКУ', 'CTA кнопка для default роли', 'text'),

-- Director role
('director_title', 'ИНВЕСТИЦИИ В НАДЕЖНОСТЬ ВАШЕГО ПРОИЗВОДСТВА', 'Hero заголовок для директора', 'text'),
('director_subtitle', 'Работаем с ЗиО-Подольск. Окупаемость модернизации — 12 месяцев. Лизинг 0%.', 'Hero подзаголовок для директора', 'text'),
('director_cta', 'РАССЧИТАТЬ ОКУПАЕМОСТЬ', 'CTA кнопка для директора', 'text'),

-- Engineer role
('engineer_title', 'ПРОДЛИМ РЕСУРС ВАШЕГО СТАНКА НА 15 ЛЕТ', 'Hero заголовок для инженера', 'text'),
('engineer_subtitle', 'Собственное производство запчастей. Соблюдаем паспортные нормы точности (ГОСТ 8-82).', 'Hero подзаголовок для инженера', 'text'),
('engineer_cta', 'СКАЧАТЬ ТЕХ. СПЕЦИФИКАЦИИ', 'CTA кнопка для инженера', 'text'),

-- Buyer role
('buyer_title', 'ПОСТАВКА КОМПЛЕКТУЮЩИХ С ОТГРУЗКОЙ ЗА 24 ЧАСА', 'Hero заголовок для закупщика', 'text'),
('buyer_subtitle', '2500 позиций на складе. Счета за 5 минут. Доставка до двери.', 'Hero подзаголовок для закупщика', 'text'),
('buyer_cta', 'ЗАПРОСИТЬ КП', 'CTA кнопка для закупщика', 'text'),

-- Company page content
('company_title', 'Инженерный Центр', 'Заголовок страницы О компании', 'text'),
('company_subtitle', 'Комплексное техническое перевооружение промышленных предприятий России', 'Подзаголовок страницы О компании', 'text'),
('company_about_title', 'О Нас', 'Заголовок секции О нас', 'text'),
('company_about_text', 'Торговый Дом «РУССтанкоСбыт» — это современный инженерный центр, специализирующийся на подборе и поставке металлообрабатывающего оборудования, а также реализации проектов "под ключ".', 'Описание компании', 'text'),
('company_about_text2', 'Мы не просто продаем станки — мы внедряем технологии, которые повышают эффективность вашего производства. Наш опыт позволяет решать задачи любой сложности: от поставки единичного оборудования до комплексного оснащения цехов.', 'Дополнительное описание', 'text'),

-- Stats
('company_stat_years', '12', 'Лет на рынке', 'text'),
('company_stat_sites', '4', 'Производственных площадки', 'text'),
('company_stat_area', '15 000', 'Кв.м. площадей', 'text'),
('company_stat_employees', '200+', 'Квалифицированных сотрудников', 'text'),

-- Values
('company_values', 'Честность и прозрачность,Технологическая независимость,Ответственность за результат,Долгосрочное партнерство', 'Ценности компании через запятую', 'text')

ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- Production sites table
CREATE TABLE IF NOT EXISTS production_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_number INTEGER NOT NULL,
    city TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert production sites
INSERT INTO production_sites (site_number, city, description, sort_order) VALUES
(1, 'РЯЗАНЬ', 'Производство полного цикла токарных станков с ЧПУ и трубонарезных станков. Участок производства зубчатых колес и шлицевых валов.', 1),
(2, 'ВОРОНЕЖ', 'Тяжелая механическая обработка деталей массой до 150 тонн. Сборочный цех с мостовым краном 160 тонн.', 2),
(3, 'ИЖЕВСК', 'Производство конических зубчатых колес с круговым зубом. Высокоточная механическая обработка корпусных деталей.', 3),
(4, 'БЕЛАРУСЬ', 'Партнерская производственная площадка. Литье станин, черновая и чистовая обработка узлов.', 4)
ON CONFLICT DO NOTHING;
