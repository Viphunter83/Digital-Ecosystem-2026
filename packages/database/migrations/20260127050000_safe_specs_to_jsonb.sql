DO $$ 
BEGIN
    -- 1. Helper function for robust conversion (temp)
    CREATE OR REPLACE FUNCTION temp_convert_to_jsonb(val text) RETURNS jsonb AS $func$
    DECLARE
        lines text[];
        line text;
        kv text[];
        res jsonb := '{}'::jsonb;
    BEGIN
        IF val IS NULL OR val = '' THEN RETURN '{}'::jsonb; END IF;
        
        -- If already looks like JSON, try to cast it
        IF val ~ '^\s*[\{\[].*[\}\]]\s*$' THEN 
            BEGIN
                RETURN val::jsonb;
            EXCEPTION WHEN OTHERS THEN 
                RETURN jsonb_build_object('raw', val);
            END;
        END IF;
        
        -- Otherwise try to parse "Key: Value" lines (common in legacy text)
        lines := string_to_array(val, E'\n');
        FOREACH line IN ARRAY lines LOOP
            IF trim(line) = '' THEN CONTINUE; END IF;
            kv := string_to_array(line, ':');
            IF array_length(kv, 1) >= 2 THEN
                res := res || jsonb_build_object(trim(kv[1]), trim(array_to_string(kv[2:], ':')));
            ELSE
                -- Keep as is in a special key if it's not a KV pair
                res := res || jsonb_build_object('unparsed_' || left(md5(line), 6), line);
            END IF;
        END LOOP;
        RETURN res;
    END;
    $func$ LANGUAGE plpgsql;

    -- 2. Convert products.specs
    BEGIN
        ALTER TABLE products ALTER COLUMN specs TYPE JSONB USING temp_convert_to_jsonb(specs);
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error converting products.specs: %', SQLERRM;
    END;

    -- 3. Convert spare_parts.specs
    BEGIN
        ALTER TABLE spare_parts ALTER COLUMN specs TYPE JSONB USING temp_convert_to_jsonb(specs);
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error converting spare_parts.specs: %', SQLERRM;
    END;

    -- Cleanup
    DROP FUNCTION temp_convert_to_jsonb(text);
END $$;
