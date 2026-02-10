import asyncio
import os
import sys
from datetime import datetime, timezone

# Add parent directory to sys.path to import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from apps.backend.app.integrations.amocrm import amocrm_client

async def test_amocrm_flow():
    print(f"--- Starting AmoCRM E2E Test ---")
    print(f"Time: {datetime.now(timezone.utc)}")
    
    if not amocrm_client.enabled:
        print("❌ AmoCRM client is NOT enabled. Check your .env file.")
        return

    print(f"✅ Client enabled for subdomain: {amocrm_client.subdomain}")
    
    # 1. Test basic connectivity / Lead creation
    test_name = f"Test Lead {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    print(f"Attempting to create lead: {test_name}...")
    
    lead_id = await amocrm_client.create_lead(
        name=test_name,
        price=1000,
        tags=["E2E-Test", "Automated"]
    )
    
    if lead_id:
        print(f"✅ Success! Lead created with ID: {lead_id}")
    else:
        print("❌ Failed to create lead. Checking refresh logic...")
        
        # 2. Try to force refresh if creation failed (or just test refresh explicitly)
        print("Attempting manual token refresh...")
        refresh_success = await amocrm_client.refresh_auth_token()
        if refresh_success:
            print("✅ Token refresh successful. Database updated.")
            # Retry creation
            print("Retrying lead creation with new token...")
            lead_id = await amocrm_client.create_lead(name=f"{test_name} (Retry)")
            if lead_id:
                 print(f"✅ Success on retry! Lead ID: {lead_id}")
            else:
                 print("❌ Still failed after refresh. Check credentials.")
        else:
            print("❌ Token refresh failed. Check CLIENT_ID/CLIENT_SECRET.")

if __name__ == "__main__":
    asyncio.run(test_amocrm_flow())
