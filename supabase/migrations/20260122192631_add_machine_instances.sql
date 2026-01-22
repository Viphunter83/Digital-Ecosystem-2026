-- Up Migration: Add machine_instances table
CREATE TABLE IF NOT EXISTS machine_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    client_id UUID REFERENCES clients(id),
    serial_number VARCHAR NOT NULL UNIQUE,
    inventory_number VARCHAR,
    manufacturing_date DATE,
    status VARCHAR DEFAULT 'operational', -- 'operational', 'maintenance', 'repair', 'offline'
    service_history JSONB DEFAULT '[]'::jsonb, -- Array of {date, title, description, status, icon}
    telemetry_summary JSONB DEFAULT '{}'::jsonb, -- Snapshot of last known vitals
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_machine_instances_client ON machine_instances(client_id);
CREATE INDEX IF NOT EXISTS idx_machine_instances_product ON machine_instances(product_id);

-- Add some seed data for demonstration
-- We need to find a product ID first to make it valid, but we can use subqueries if needed
-- Alternatively, we'll use the CNC model we've been referencing

DO $$
DECLARE
    v_product_id UUID;
    v_client_id UUID;
BEGIN
    -- Get or create a sample client if none exists
    SELECT id INTO v_client_id FROM clients LIMIT 1;
    IF v_client_id IS NULL THEN
        INSERT INTO clients (name, inn) VALUES ('ГРУППА СТАНКОЗИТ', '7700123456') RETURNING id INTO v_client_id;
    END IF;

    -- Get a sample product
    SELECT id INTO v_product_id FROM products WHERE slug = '1m63-chnpu' LIMIT 1;
    -- If not found, try any product
    IF v_product_id IS NULL THEN
        SELECT id INTO v_product_id FROM products LIMIT 1;
    END IF;

    -- Insert Sample Instance if we have a product
    IF v_product_id IS NOT NULL THEN
        INSERT INTO machine_instances (product_id, client_id, serial_number, inventory_number, status, service_history)
        VALUES (
            v_product_id,
            v_client_id,
            'CNC-2026-X',
            '#992811',
            'repair',
            '[
                {"date": "15.01.2026", "title": "Заявка принята", "description": "Запрос на капремонт через ТМА", "status": "done", "icon": "CheckCircle2"},
                {"date": "16.01.2026", "title": "Дефектовка", "description": "Выявлен износ направляющих", "status": "done", "icon": "Wrench"},
                {"date": "В процессе", "title": "Ремонт", "description": "Шлифовка станины", "status": "active", "icon": "Clock"},
                {"date": "-", "title": "Готово", "description": "Сдача ОТК", "status": "pending", "icon": "CheckCircle2"}
            ]'::jsonb
        ) ON CONFLICT (serial_number) DO NOTHING;
    END IF;
END $$;
