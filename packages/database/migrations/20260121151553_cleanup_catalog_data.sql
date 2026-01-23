-- Migration: cleanup_catalog_data
-- Description: Очистка данных каталога: удаление мусора, дедупликация, классификация, изображения
-- Date: 2026-01-21

-- =============================================================================
-- ФАЗА 0: Бэкап (сохраняем статистику до очистки)
-- =============================================================================
DO $$
DECLARE
    v_total_before INTEGER;
    v_unique_before INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_before FROM products;
    SELECT COUNT(DISTINCT name) INTO v_unique_before FROM products;
    RAISE NOTICE 'BEFORE CLEANUP: Total products = %, Unique names = %', v_total_before, v_unique_before;
END $$;

-- =============================================================================
-- ФАЗА 1: Удаление мусорных данных (не-станки)
-- =============================================================================
-- Удаляем записи, которые явно НЕ являются станками

-- 1.1 Удаляем изображения мусорных товаров
DELETE FROM product_images 
WHERE product_id IN (
    SELECT id FROM products 
    WHERE name ~* 'Металлы.*Чугунное|Маслоуказатели.*Клиновые|круг$|Пояса монтажные'
       OR name ~* '^ТД РУССтанкоСбыт - (венец|колесо|втулка|сектор|Кол\.зуб)'
       OR name ~* 'зубчатое|Сектор$'
);

-- 1.2 Удаляем сами мусорные товары
DELETE FROM products 
WHERE name ~* 'Металлы.*Чугунное|Маслоуказатели.*Клиновые|круг$|Пояса монтажные'
   OR name ~* '^ТД РУССтанкоСбыт - (венец|колесо|втулка|сектор|Кол\.зуб)'
   OR name ~* 'зубчатое|Сектор$';

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'PHASE 1: Deleted % junk products', v_count;
END $$;

-- =============================================================================
-- ФАЗА 2: Дедупликация по названию
-- =============================================================================
-- Удаляем изображения дубликатов
DELETE FROM product_images 
WHERE product_id NOT IN (
    SELECT DISTINCT ON (name) id 
    FROM products 
    ORDER BY name, created_at DESC NULLS LAST, id
);

-- Удаляем дубликаты, оставляем последнюю запись для каждого уникального названия
DELETE FROM products 
WHERE id NOT IN (
    SELECT DISTINCT ON (name) id 
    FROM products 
    ORDER BY name, created_at DESC NULLS LAST, id
);

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM products;
    RAISE NOTICE 'PHASE 2: After deduplication, % products remain', v_count;
END $$;

-- =============================================================================
-- ФАЗА 3: Классификация по категориям
-- =============================================================================
-- Автоматическая классификация по ключевым словам в названии

UPDATE products 
SET category = CASE 
    -- Токарные станки (модели 16К, 1М63, РТ7xx, 1В340, 1П42 и т.д.)
    WHEN name ~* 'токарн|16К|16М|1М63|1М65|РТ7[0-9]|1В34|1П42|СА630|СВ141' THEN 'Turning'
    
    -- Фрезерные станки (модели 6Р, 6Т, ГФ21xx)
    WHEN name ~* 'фрезер|6Р1[0-9]|6Т1[0-9]|ГФ21' THEN 'Milling'
    
    -- Сверлильные станки (модели 2С1xx, СВ1)
    WHEN name ~* 'сверл|2С1[0-9]{2}|СВ1[0-9]{2}' THEN 'Drilling'
    
    -- Шлифовальные станки (модели 3Л7xx, 3Е7xx, 4Л7xx, 3Д7xx)
    WHEN name ~* 'шлифов|3Л7|3Е7|4Л7|3Д7|5Е7' THEN 'Grinding'
    
    -- Прессы
    WHEN name ~* 'пресс|П63' THEN 'Pressing'
    
    -- Лазерные/плазменные
    WHEN name ~* 'лазер|плазм' THEN 'Laser'
    
    -- Обрабатывающие центры и станки с ЧПУ
    WHEN name ~* 'ЧПУ|обрабатывающ|центр|ИР500|500МФ' THEN 'CNC Machines'
    
    -- Всё остальное
    ELSE 'Other'
END
WHERE category = 'Machine';

DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'PHASE 3: Category distribution:';
    FOR rec IN SELECT category, COUNT(*) as cnt FROM products GROUP BY category ORDER BY cnt DESC
    LOOP
        RAISE NOTICE '  % = %', rec.category, rec.cnt;
    END LOOP;
END $$;

-- =============================================================================
-- ФАЗА 4: Назначение изображений-заглушек по категориям
-- =============================================================================
-- Создаём product_images для товаров без изображений

INSERT INTO product_images (id, product_id, url, is_primary, "order")
SELECT 
    gen_random_uuid(),
    p.id,
    CASE p.category
        WHEN 'Turning' THEN '/images/products/product_cnc.png'
        WHEN 'Milling' THEN '/images/products/product_milling.png'
        WHEN 'Drilling' THEN '/images/products/product_cnc.png'
        WHEN 'Grinding' THEN '/images/products/product_cnc.png'
        WHEN 'Pressing' THEN '/images/products/product_press.png'
        WHEN 'Laser' THEN '/images/products/product_laser.png'
        WHEN 'CNC Machines' THEN '/images/products/product_cnc.png'
        ELSE '/images/products/product_conveyor.png'
    END,
    true,
    0
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

DO $$
DECLARE
    v_with_images INTEGER;
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM products;
    SELECT COUNT(DISTINCT p.id) INTO v_with_images 
    FROM products p 
    WHERE EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);
    RAISE NOTICE 'PHASE 4: Products with images = % / %', v_with_images, v_total;
END $$;

-- =============================================================================
-- ФАЗА 5: Очистка названий (удаляем префикс "ТД РУССтанкоСбыт - ")
-- =============================================================================
UPDATE products
SET name = REGEXP_REPLACE(name, '^ТД РУССтанкоСбыт - ', '')
WHERE name LIKE 'ТД РУССтанкоСбыт - %';

-- =============================================================================
-- ИТОГОВАЯ СТАТИСТИКА
-- =============================================================================
DO $$
DECLARE
    v_total INTEGER;
    v_with_images INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO v_total FROM products;
    SELECT COUNT(DISTINCT p.id) INTO v_with_images 
    FROM products p 
    WHERE EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'CLEANUP COMPLETE!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total products: %', v_total;
    RAISE NOTICE 'Products with images: % (%.1f%%)', v_with_images, (v_with_images::float / GREATEST(v_total, 1) * 100);
    RAISE NOTICE '';
    RAISE NOTICE 'Category distribution:';
    FOR rec IN SELECT category, COUNT(*) as cnt FROM products GROUP BY category ORDER BY cnt DESC
    LOOP
        RAISE NOTICE '  %-20s %s', rec.category, rec.cnt;
    END LOOP;
END $$;
