
import asyncio
import aiohttp
import json

BACKEND_URL = "http://localhost:8000"

async def test_order_ingestion():
    # Payload matching what Bot sends
    payload = {
        "source": "bot_order",
        "name": "Test User",
        "message": "Test Order Message",
        "meta": {
            "telegram_user_id": 123456789,
            "order_data": {
                "type": "ORDER",
                "items": [
                    {"id": "test-1", "name": "Drill Bit", "quantity": 2, "price": 1500}
                ],
                "total": 3000
            }
        }
    }

    print(f"Sending payload to {BACKEND_URL}/ingest/leads...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BACKEND_URL}/ingest/leads", json=payload) as resp:
                print(f"Status: {resp.status}")
                text = await resp.text()
                print(f"Response: {text}")
                
                if resp.status == 200:
                    print("✅ SUCCESS: Order ingested correctly.")
                else:
                    print("❌ FAILED: Backend rejected the order.")
                    
    except Exception as e:
        print(f"❌ ERROR: Connection failed. {e}")

if __name__ == "__main__":
    asyncio.run(test_order_ingestion())
