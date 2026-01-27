import os
import requests
from dotenv import load_dotenv

load_dotenv()

DIRECTUS_URL = "https://admin.td-rss.ru"
EMAIL = "Info@tdrusstankosbyt.ru"
PASSWORD = os.getenv("ADMIN_PASSWORD")

# IDs to KEEP
KEEP_IDS = [
    '00c8aa75-d9f1-44ed-8b6f-1f279945b332',
    '0113b153-9d65-42ca-9280-fc36e3d1711b',
    'afbe4ab7-cf40-4fd1-98d7-5a7fd91df5bd',
    '1ab07b40-2540-4328-8c66-f9bea8f78c20'
]

def emergency_cleanup():
    # 1. Login
    print(f"Logging in to {DIRECTUS_URL}...")
    login_resp = requests.post(f"{DIRECTUS_URL}/auth/login", json={
        "email": EMAIL,
        "password": PASSWORD
    })
    login_resp.raise_for_status()
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get all product IDs
    print("Fetching product list...")
    items_resp = requests.get(f"{DIRECTUS_URL}/items/products", params={
        "fields": "id",
        "limit": -1
    }, headers=headers)
    items_resp.raise_for_status()
    all_items = items_resp.json()["data"]
    
    ids_to_delete = [item["id"] for item in all_items if item["id"] not in KEEP_IDS]
    
    if not ids_to_delete:
        print("Everything already clean!")
        return

    print(f"Deleting {len(ids_to_delete)} products...")
    
    # Directus supports batch delete
    # We delete in chunks to avoid URL length issues or timeouts
    chunk_size = 50
    for i in range(0, len(ids_to_delete), chunk_size):
        chunk = ids_to_delete[i:i + chunk_size]
        print(f"Deleting chunk {i // chunk_size + 1}...")
        del_resp = requests.delete(f"{DIRECTUS_URL}/items/products", json=chunk, headers=headers)
        if del_resp.status_code == 204:
            print(f"✅ Deleted {len(chunk)} items")
        else:
            print(f"❌ Error deleting chunk: {del_resp.text}")

if __name__ == "__main__":
    emergency_cleanup()
