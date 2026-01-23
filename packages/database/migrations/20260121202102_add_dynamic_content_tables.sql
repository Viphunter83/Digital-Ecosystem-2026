-- Migration: Create tables for dynamic content (solutions, offices) and populate site_content
-- Timestamp: 20260121202102

-- =============================================
-- 1. CREATE SOLUTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- lucide icon name (e.g., 'Box', 'Zap', 'Cpu')
    gradient VARCHAR(100), -- tailwind gradient classes
    link_url VARCHAR(200) DEFAULT '/contacts',
    link_text VARCHAR(100) DEFAULT 'Обсудить Проект',
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed solutions from hardcoded data
INSERT INTO solutions (slug, title, description, icon, gradient, link_url, link_text, sort_order) VALUES
('turnkey', 'Оснащение под ключ', 'Комплексное техническое перевооружение предприятий. От аудита технологии до запуска производства.', 'Box', 'from-blue-900/20 to-black', '/contacts', 'Обсудить Проект', 1),
('automation', 'Автоматизация и Роботизация', 'Внедрение роботизированных ячеек и автоматических линий для серийного производства.', 'Zap', 'from-purple-900/20 to-black', '/contacts', 'Обсудить Проект', 2),
('digital', 'Цифровой Двойник', 'Разработка цифровых двойников производства для оптимизации процессов и предиктивного обслуживания.', 'Cpu', 'from-emerald-900/20 to-black', '/digital-twin', 'Запустить Демо', 3),
('service', 'Сервис и Экспертиза', '24/7 техническая поддержка, обучение персонала и проведение пуско-наладочных работ.', 'ShieldCheck', 'from-orange-900/20 to-black', '/contacts', 'Обсудить Проект', 4)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 2. CREATE OFFICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100),
    region VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_headquarters BOOLEAN DEFAULT false,
    description TEXT,
    working_hours VARCHAR(100) DEFAULT 'Пн-Пт: 9:00-18:00',
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed offices from hardcoded data
INSERT INTO offices (name, city, region, address, phone, email, latitude, longitude, is_headquarters, description, sort_order) VALUES
('Центральный офис', 'Москва', 'Москва, Россия', 'Москва, Россия', '+7 (499) 390-85-04', 'zakaz@tdrusstankosbyt.ru', 55.751244, 37.618423, true, 'Центральный офис и инженерный центр.', 1)
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. ADD HERO CONTENT TO SITE_CONTENT
-- =============================================
INSERT INTO site_content (key, value) VALUES
-- Default role
('default_title', 'ОБЕСПЕЧИВАЕМ БЕСПЕРЕБОЙНУЮ РАБОТУ СТАНОЧНОГО ПАРКА'),
('default_subtitle', 'Комплексные поставки металлообрабатывающего оборудования. Сервис, лизинг, цифровизация.'),
('default_cta', 'ЗАПУСТИТЬ ДИАГНОСТИКУ'),
-- Director role
('director_title', 'ИНВЕСТИЦИИ В НАДЕЖНОСТЬ ВАШЕГО ПРОИЗВОДСТВА'),
('director_subtitle', 'Работаем с ЗиО-Подольск. Окупаемость модернизации — 12 месяцев. Лизинг 0%.'),
('director_cta', 'РАССЧИТАТЬ ОКУПАЕМОСТЬ'),
-- Engineer role  
('engineer_title', 'ПРОДЛИМ РЕСУРС ВАШЕГО СТАНКА НА 15 ЛЕТ'),
('engineer_subtitle', 'Собственное производство запчастей. Соблюдаем паспортные нормы точности (ГОСТ 8-82).'),
('engineer_cta', 'СКАЧАТЬ ТЕХ. СПЕЦИФИКАЦИИ'),
-- Buyer role
('buyer_title', 'ПОСТАВКА КОМПЛЕКТУЮЩИХ С ОТГРУЗКОЙ ЗА 24 ЧАСА'),
('buyer_subtitle', '2500 позиций на складе. Счета за 5 минут. Доставка до двери.'),
('buyer_cta', 'ЗАПРОСИТЬ КП')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 4. ADD FAQ JSON TO SITE_CONTENT
-- =============================================
INSERT INTO site_content (key, value) VALUES
('faq_json', '[
  {
    "category": "Оплата и Доставка (Для Снабженцев)",
    "items": [
      {"question": "Вы работаете с НДС?", "answer": "Да, все цены включают НДС 20%. Мы предоставляем полный пакет закрывающих документов через ЭДО (Диадок/СБИС) или курьером."},
      {"question": "Как быстро происходит отгрузка?", "answer": "Складские позиции (2500+ SKU) отгружаются в день оплаты. Сложные узлы — от 3 дней."}
    ]
  },
  {
    "category": "Технические вопросы (Для Инженеров)",
    "items": [
      {"question": "Есть ли гарантия на запчасти после ремонта?", "answer": "Да. 12 месяцев на новые узлы и 6 месяцев на восстановленные. Мы прикладываем паспорт качества к каждому изделию."},
      {"question": "Выезжают ли ваши специалисты в регионы?", "answer": "Наша сервисная бригада работает по всей РФ. Выезд для диагностики — от 24 часов после заявки."}
    ]
  },
  {
    "category": "Финансы (Для Директоров)",
    "items": [
      {"question": "Возможен ли лизинг на модернизацию?", "answer": "Мы аккредитованы в СберЛизинг и ВТБ Лизинг. Возможна рассрочка платежа для госпредприятий."}
    ]
  }
]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 5. ADD COMPANY PAGE CONTENT TO SITE_CONTENT
-- =============================================
INSERT INTO site_content (key, value) VALUES
('company_title', 'О КОМПАНИИ'),
('company_subtitle', 'ТД РусСтанкоСбыт — Ваш надежный партнер в сфере промышленного оборудования'),
('company_description', 'Мы специализируемся на поставках металлообрабатывающего оборудования, запасных частей и комплексного сервиса для промышленных предприятий России. Более 15 лет опыта, собственный склад запчастей и команда квалифицированных инженеров.'),
('company_stats_years', '15+'),
('company_stats_years_label', 'лет на рынке'),
('company_stats_clients', '500+'),
('company_stats_clients_label', 'предприятий-клиентов'),
('company_stats_parts', '2500+'),
('company_stats_parts_label', 'позиций на складе'),
('company_stats_engineers', '25+'),
('company_stats_engineers_label', 'инженеров в команде')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 6. VERIFY
-- =============================================
SELECT 'solutions' as table_name, COUNT(*) as count FROM solutions
UNION ALL
SELECT 'offices', COUNT(*) FROM offices
UNION ALL
SELECT 'site_content', COUNT(*) FROM site_content;
