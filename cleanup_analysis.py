import json

def is_filled(item):
    name = item.get('name', '')
    desc = item.get('description', '')
    specs = item.get('specs', {})
    images = item.get('image_file')

    # Basic heuristic for "filled"
    if not name or len(name) < 5: return False
    # Avoid technical/temp names
    if "№п/п" in name or "ИНН" in name or "Контактная информация" in name: return False
    
    has_desc = desc and len(desc) > 50
    has_specs = specs and (isinstance(specs, list) and len(specs) > 0 or isinstance(specs, dict) and len(specs) > 0)
    has_image = images is not None
    
    return has_desc and (has_specs or has_image)

# I will provide the JSON data via another script if needed, but for now I'll just explain the logic.
