-- Data migration to ensure CNC-2026-X instance exists
DO $$
DECLARE
    v_product_id UUID;
    v_client_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO v_product_id FROM products WHERE slug = '1m63-cnc' LIMIT 1;
    SELECT id INTO v_client_id FROM clients WHERE name = 'МТЗ' LIMIT 1;

    IF v_product_id IS NOT NULL AND v_client_id IS NOT NULL THEN
        -- Insert instance if not exists
        INSERT INTO machine_instances (
            serial_number, 
            inventory_number, 
            product_id, 
            client_id, 
            status, 
            service_history, 
            telemetry_summary
        )
        VALUES (
            'CNC-2026-X', 
            '#992811', 
            v_product_id, 
            v_client_id, 
            'repair', 
            '[
                {"date": "15.01.2026", "title": "Заявка принята", "description": "Запрос на капремонт через ТМА", "status": "done", "icon": "CheckCircle2"},
                {"date": "16.01.2026", "title": "Дефектовка", "description": "Выявлен износ направляющих", "status": "done", "icon": "Wrench"},
                {"date": "В процессе", "title": "Ремонт", "description": "Шлифовка станины", "status": "active", "icon": "Clock"},
                {"date": "-", "title": "Готово", "description": "Сдача ОТК", "status": "pending", "icon": "CheckCircle2"}
            ]'::jsonb,
            '{}'::jsonb
        )
        ON CONFLICT (serial_number) DO NOTHING;
    END IF;
END $$;
