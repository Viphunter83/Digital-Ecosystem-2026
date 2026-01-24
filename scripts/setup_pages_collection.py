import requests
import os

DIRECTUS_URL = "https://admin.td-rss.ru"
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "aA0tIPuv1ad7TFsaTr_lLATfM5cjHKgA")

headers = {
    "Authorization": f"Bearer {DIRECTUS_TOKEN}",
    "Content-Type": "application/json"
}

def create_collection():
    print("Creating 'pages' collection...")
    payload = {
        "collection": "pages",
        "meta": {
            "singleton": False,
            "icon": "article",
            "note": "Static site pages (About, Delivery, etc.)"
        },
        "schema": {}
    }
    response = requests.post(f"{DIRECTUS_URL}/collections", headers=headers, json=payload)
    if response.status_code == 200:
        print("Collection 'pages' created successfully.")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def create_fields():
    fields = [
        {"field": "title", "type": "string", "meta": {"interface": "input", "width": "full", "required": True}},
        {"field": "slug", "type": "string", "meta": {"interface": "input", "width": "half", "required": True}},
        {"field": "content", "type": "text", "meta": {"interface": "input-rich-text-html", "width": "full"}},
        {"field": "seo_title", "type": "string", "meta": {"interface": "input", "width": "full"}},
        {"field": "seo_description", "type": "text", "meta": {"interface": "input-multiline", "width": "full"}},
        {"field": "is_published", "type": "boolean", "meta": {"interface": "boolean", "width": "half"}}
    ]
    
    for field_data in fields:
        print(f"Creating field '{field_data['field']}'...")
        response = requests.post(f"{DIRECTUS_URL}/fields/pages", headers=headers, json=field_data)
        if response.status_code == 200:
            print(f"Field '{field_data['field']}' created successfully.")
        else:
            print(f"Error creating field '{field_data['field']}': {response.status_code} - {response.text}")

if __name__ == "__main__":
    create_collection()
    create_fields()
