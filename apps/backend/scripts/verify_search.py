import asyncio
import sys
import os
from dotenv import load_dotenv

# Add root to python path
sys.path.append(os.getcwd())
load_dotenv()

# FIX: Handle local macOS postgres user (often current OS user instead of 'postgres')
db_url = os.environ.get("DATABASE_URL", "")
if db_url:
    db_url = db_url.replace("localhost", "127.0.0.1")
    # If connecting to local postgres on mac, the role 'postgres' might not exist.
    # We try to use the owner of the DB if 'postgres' fails, but here we just allow override.
    os.environ["DATABASE_URL"] = db_url

from apps.backend.app.core.database import SessionLocal
from apps.backend.services.ai_service import AIService
from packages.database.models import Product
from sqlalchemy import select
from sqlalchemy.orm import joinedload

async def test_search(query: str):
    print(f"\n--- Testing Query: '{query}' ---")
    ai = AIService()
    try:
        embedding = await ai.get_embedding(query)
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return

    db = SessionLocal()
    try:
        # Cosine distance: 0 = identical, 1 = orthogonal, 2 = opposite
        distance_expr = Product.embedding.cosine_distance(embedding).label("distance")
        
        # Get top 5 regardless of threshold to see distribution
        stmt = select(Product, distance_expr).where(Product.is_published == True).order_by(distance_expr).limit(5)
        results = db.execute(stmt).unique().all()
        
        print(f"{'DISTANCE':<10} | {'NAME'}")
        print("-" * 60)
        for product, dist in results:
            mark = "✅" if dist < 0.6 else "❌"
            print(f"{dist:.4f} {mark}  | {product.name}")
            
    finally:
        db.close()

async def main():
    queries = [
        "Токарный станок",       # Direct match (Expect < 0.3)
        "Станок для металла",    # Broad match (Expect < 0.5)
        "Кофемашина",            # Irrelevant (Expect > 0.6)
        "ЧПУ",                   # Feature match (Expect < 0.5)
        "SCM"                    # Brand match (Expect < 0.5 if SCM exists)
    ]
    for q in queries:
        await test_search(q)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        asyncio.run(test_search(sys.argv[1]))
    else:
        asyncio.run(main())
