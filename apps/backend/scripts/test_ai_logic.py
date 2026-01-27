import asyncio
import os
import sys
from dotenv import load_dotenv

# Add root to python path
sys.path.append(os.getcwd())
load_dotenv()

from apps.backend.services.ai_service import AIService

async def test_ai():
    ai = AIService()
    queries = ["Токарный станок", "ЧПУ", "Резка металла"]
    
    print("\n--- TESTING QUERY EXPANSION ---")
    for q in queries:
        try:
            expanded = await ai.expand_query(q)
            print(f"Original: '{q}'")
            print(f"Expanded: '{expanded}'")
            print("-" * 20)
        except Exception as e:
            print(f"Error expanding '{q}': {e}")

    print("\n--- TESTING EMBEDDING ---")
    try:
        emb = await ai.get_embedding("Test text")
        print(f"Embedding success! Length: {len(emb)}")
        print(f"First 5 values: {emb[:5]}")
    except Exception as e:
        print(f"Error getting embedding: {e}")

if __name__ == "__main__":
    asyncio.run(test_ai())
