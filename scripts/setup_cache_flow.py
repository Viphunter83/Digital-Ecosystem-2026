import requests
import os

DIRECTUS_URL = "https://admin.td-rss.ru"
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "aA0tIPuv1ad7TFsaTr_lLATfM5cjHKgA")
WEBHOOK_URL = "https://api.td-rss.ru/webhook/clear-cache"
WEBHOOK_SECRET = "rss-secret-2026"

headers = {
    "Authorization": f"Bearer {DIRECTUS_TOKEN}",
    "Content-Type": "application/json"
}

def create_flow():
    print("Creating 'Cache Invalidation' flow...")
    flow_payload = {
        "name": "Cache Invalidation Webhook",
        "icon": "refresh",
        "color": "#6644FF",
        "description": "Triggered on any content change to clear frontend cache.",
        "status": "active",
        "trigger": "event",
        "options": {
            "type": "action",
            "scope": ["items.create", "items.update", "items.delete"],
            "collections": ["products", "spare_parts", "articles", "services", "solutions", "globals", "pages"]
        }
    }
    
    response = requests.post(f"{DIRECTUS_URL}/flows", headers=headers, json=flow_payload)
    if response.status_code != 200:
        print(f"Error creating flow: {response.status_code} - {response.text}")
        return

    flow_id = response.json()["data"]["id"]
    print(f"Flow created with ID: {flow_id}")

    # Add Webhook Operation
    operation_payload = {
        "name": "Trigger Cache Refresh",
        "key": "webhook_operation",
        "type": "request",
        "flow": flow_id,
        "options": {
            "method": "POST",
            "url": WEBHOOK_URL,
            "headers": [
                {"header": "X-Webhook-Secret", "value": WEBHOOK_SECRET}
            ]
        }
    }
    
    response = requests.post(f"{DIRECTUS_URL}/operations", headers=headers, json=operation_payload)
    if response.status_code == 200:
        print("Webhook operation added to flow successfully.")
    else:
        print(f"Error adding operation: {response.status_code} - {response.text}")

if __name__ == "__main__":
    create_flow()
