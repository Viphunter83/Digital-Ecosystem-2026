-- Create slugify function (transliteration + cleanup)
CREATE OR REPLACE FUNCTION slugify(value TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  IF value IS NULL THEN
    RETURN NULL;
  END IF;
  
  slug := lower(value);
  
  -- Cyrillic transliteration
  slug := translate(slug, 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя', 'abvgdeezzjiklmnoprstufhccssyyeyua');
  
  -- Replacements for compound characters
  slug := replace(slug, ' ', '-');
  slug := replace(slug, 'щ', 'shch');
  slug := replace(slug, 'ш', 'sh');
  slug := replace(slug, 'ч', 'ch');
  slug := replace(slug, 'ж', 'zh');
  slug := replace(slug, 'я', 'ya');
  slug := replace(slug, 'ю', 'yu');
  slug := replace(slug, 'ё', 'yo');

  slug := regexp_replace(slug, '[^a-z0-9\\-_]+', '-', 'gi');
  slug := regexp_replace(slug, '^-+|-+$', '', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function
CREATE OR REPLACE FUNCTION handle_slug_automation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trg_products_slug ON products;
CREATE TRIGGER trg_products_slug
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION handle_slug_automation();

DROP TRIGGER IF EXISTS trg_spare_parts_slug ON spare_parts;
CREATE TRIGGER trg_spare_parts_slug
BEFORE INSERT OR UPDATE ON spare_parts
FOR EACH ROW EXECUTE FUNCTION handle_slug_automation();

-- Backfill existing NULL slugs
UPDATE products SET slug = slugify(name) WHERE slug IS NULL OR slug = '';
UPDATE spare_parts SET slug = slugify(name) WHERE slug IS NULL OR slug = '';
