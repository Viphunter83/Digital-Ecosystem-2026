-- Migration: Create service_cases table and add image_file support
-- Created at: 2026-01-24 18:13:04

-- 1. Create service_cases table
CREATE TABLE IF NOT EXISTS public.service_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    problem TEXT,
    solution TEXT,
    result TEXT,
    image_file UUID, -- Directus file reference
    image_url TEXT,  -- External link
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add image_file columns to existing tables
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_file UUID;
ALTER TABLE public.spare_parts ADD COLUMN IF NOT EXISTS image_file UUID;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS image_file UUID;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_file UUID;

-- 3. Add directus_id column to images tables for better mapping if not exists
ALTER TABLE public.spare_part_images ADD COLUMN IF NOT EXISTS image_file UUID;

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_service_cases_service_id ON public.service_cases(service_id);
CREATE INDEX IF NOT EXISTS idx_service_cases_sort_order ON public.service_cases(sort_order);
