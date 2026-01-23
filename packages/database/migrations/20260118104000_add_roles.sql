-- Up Migration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('director', 'engineer', 'procurement');
    END IF;
END$$;

ALTER TABLE telegram_users 
ADD COLUMN IF NOT EXISTS role user_role,
ADD COLUMN IF NOT EXISTS company_name VARCHAR,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
