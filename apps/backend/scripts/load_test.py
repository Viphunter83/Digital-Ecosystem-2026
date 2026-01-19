import asyncio
import aiohttp
import time
import random
import logging

# Config
BASE_URL = "http://localhost:8000"
CONCURRENT_USERS = 20
TOTAL_REQUESTS = 200

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def simulate_user(session, user_id):
    """
    Simulates a user flow:
    1. Search for generic term (Cached?)
    2. Search for specific complex term (Semantic)
    3. View a random page (Journal)
    """
    start_time = time.time()
    
    # 1. Generic Search
    try:
        async with session.get(f"{BASE_URL}/catalog/search?q=cnc") as resp:
            if resp.status != 200:
                logger.error(f"User {user_id}: Search Generic failed: {resp.status}")
    except Exception as e:
        logger.error(f"User {user_id}: Search Generic Error: {e}")

    # 2. Semantic Search (Heavy)
    try:
        queries = ["machine for steel cutting", "high precision lathe", "industrial robot arm"]
        q = random.choice(queries)
        async with session.get(f"{BASE_URL}/catalog/search?q={q}") as resp:
             if resp.status != 200:
                logger.error(f"User {user_id}: Semantic Search failed: {resp.status}")
    except Exception as e:
        logger.error(f"User {user_id}: Semantic Search Error: {e}")

    # 3. Submit Lead (Write Op)
    try:
        payload = {
            "source": "site",
            "name": f"LoadUser_{user_id}",
            "phone": "+79000000000",
            "message": "Load Test Message"
        }
        async with session.post(f"{BASE_URL}/ingest/leads", json=payload) as resp:
            if resp.status != 200:
                logger.error(f"User {user_id}: Lead Submit failed: {resp.status}")
    except Exception as e:
        logger.error(f"User {user_id}: Lead Submit Error: {e}")

    duration = time.time() - start_time
    # logger.info(f"User {user_id} finished flow in {duration:.2f}s")
    return duration

async def main():
    logger.info(f"Starting Load Test: {CONCURRENT_USERS} users, Target {TOTAL_REQUESTS} flows...")
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(CONCURRENT_USERS):
            tasks.append(simulate_user(session, i))
        
        # We want to run TOTAL_REQUESTS, but cleanly let's just run one batch of concurrent users for now to test blocking.
        # If we want 200 requests, we can loop.
        
        start_total = time.time()
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_total
        
        avg_time = sum(results) / len(results)
        logger.info(f"Test Completed in {total_time:.2f}s")
        logger.info(f"Average Flow Time: {avg_time:.2f}s")
        logger.info(f"Requests per Second (Flows): {CONCURRENT_USERS / total_time:.2f}")

if __name__ == "__main__":
    asyncio.run(main())
