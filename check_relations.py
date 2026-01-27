import os
import requests
from dotenv import load_dotenv

load_dotenv()

DIRECTUS_URL = "https://admin.td-rss.ru"
EMAIL = "admin@russtanko.ru"
PASSWORD = os.getenv("ADMIN_PASSWORD")

def get_relations():
    s = requests.Session()
    # Login
    r = s.post(f"{DIRECTUS_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if r.status_code != 200:
        print(f"Login failed: {r.status_code}")
        return
    
    token = r.json()["data"]["access_token"]
    
    # Get relations
    r = s.get(f"{DIRECTUS_URL}/relations", headers={"Authorization": f"Bearer {token}"})
    if r.status_code != 200:
        print(f"Failed to get relations: {r.status_code}")
        return
    
    data = r.json().get("data", [])
    
    print("\nRESOURCES POINTING TO PRODUCTS:")
    for rel in data:
        if rel.get("related_collection") == "products":
            print(f"{rel.get('collection')}.{rel.get('field')} -> products")
            
    print("\nRESOURCES POINTING TO CLIENT_EQUIPMENT:")
    for rel in data:
        if rel.get("related_collection") == "client_equipment":
            print(f"{rel.get('collection')}.{rel.get('field')} -> client_equipment")

if __name__ == "__main__":
    get_relations()
