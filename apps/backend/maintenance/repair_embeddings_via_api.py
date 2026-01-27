import os
import asyncio
import httpx
import sys
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.getcwd())
try:
    from apps.backend.services.ai_service import AIService
except ImportError:
    # Fallback for relative paths if needed
    sys.path.append(os.path.join(os.getcwd(), "apps", "backend"))
    from services.ai_service import AIService

load_dotenv()

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "https://admin.td-rss.ru").rstrip("/")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

async def repair_embeddings():
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        print("Error: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env")
        return

    ai_service = AIService()
    
    async with httpx.AsyncClient() as client:
        # 1. Login
        print(f"Logging in to Directus at {DIRECTUS_URL}...")
        try:
            login_res = await client.post(f"{DIRECTUS_URL}/auth/login", json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            })
            login_res.raise_for_status()
            token = login_res.json()["data"]["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("Login successful.")
        except Exception as e:
            print(f"Login failed: {e}")
            return
        
        # 2. Fetch products without embeddings
        print("Fetching products without embeddings...")
        prod_res = await client.get(f"{DIRECTUS_URL}/items/products", params={
            "filter": {"embedding": {"_null": True}},
            "fields": "id,name,category,specs,description"
        }, headers=headers)
        products = prod_res.json().get("data", [])
        
        print(f"Found {len(products)} products to process.")
        for p in products:
            # Construct text
            specs = p.get("specs") or {}
            if isinstance(specs, list):
                specs_str = ", ".join([f"{s.get('key')}: {s.get('value')}" for s in specs if isinstance(s, dict)])
            else:
                specs_str = ", ".join([f"{k}: {v}" for k, v in specs.items()])
            
            text = f"{p['name']} Category: {p.get('category')}. Specs: {specs_str}. {p.get('description') or ''}"
            print(f"Generating embedding for: {p['name']}")
            try:
                emb = await ai_service.get_embedding(text)
                # 3. Update product
                update_res = await client.patch(f"{DIRECTUS_URL}/items/products/{p['id']}", json={
                    "embedding": emb
                }, headers=headers)
                update_res.raise_for_status()
                print(f"Updated {p['name']}")
            except Exception as e:
                print(f"Error updating {p['name']}: {e}")

        # 4. Fetch spare parts without embeddings
        print("Fetching spare parts without embeddings...")
        spare_res = await client.get(f"{DIRECTUS_URL}/items/spare_parts", params={
            "filter": {"embedding": {"_null": True}},
            "fields": "id,name,specs"
        }, headers=headers)
        spares = spare_res.json().get("data", [])
        
        print(f"Found {len(spares)} spare parts to process.")
        for s in spares:
            # Construct text
            specs = s.get("specs") or {}
            if isinstance(specs, list):
                specs_str = ", ".join([f"{item.get('key')}: {item.get('value')}" for item in specs if isinstance(item, dict)])
            else:
                specs_str = ", ".join([f"{k}: {v}" for k, v in specs.items()])
            
            text = f"{s['name']} Category: Запчасти. Specs: {specs_str}."
            print(f"Generating embedding for spare: {s['name']}")
            try:
                emb = await ai_service.get_embedding(text)
                # Update spare part
                update_res = await client.patch(f"{DIRECTUS_URL}/items/spare_parts/{s['id']}", json={
                    "embedding": emb
                }, headers=headers)
                update_res.raise_for_status()
                print(f"Updated spare {s['name']}")
            except Exception as e:
                print(f"Error updating spare {s['name']}: {e}")

if __name__ == "__main__":
    asyncio.run(repair_embeddings())
