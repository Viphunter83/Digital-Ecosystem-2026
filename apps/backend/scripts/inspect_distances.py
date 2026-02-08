
import asyncio
import os
import sys
from sqlalchemy import select

# Ensure apps module is found
sys.path.append(os.getcwd())

from apps.backend.app.core.database import SessionLocal
from packages.database.models import Product
from apps.backend.services.ai_service import AIService

async def test_distances():
    db = SessionLocal()
    ai = AIService()
    q = "оборудование для сверления"
    
    # 1. Expand query
    expanded_q = await ai.expand_query(q)
    print(f"Expanded Query: {expanded_q}")
    
    # 2. Get embedding
    emb = await ai.get_embedding(expanded_q)
    
    # 3. Get all products and calculate manual distance
    items = db.query(Product).all()
    distances = []
    
    print("\nDistances (Lower is closer):")
    print("-" * 50)
    for p in items:
        if p.embedding:
            # We use the same distance as pgvector (cosine)
            # dist = 1 - (A . B) / (||A|| ||B||)
            # But here we can just use the db's calculation for accuracy
            stmt = select(Product.embedding.cosine_distance(emb)).where(Product.id == p.id)
            dist = db.execute(stmt).scalar()
            distances.append((p.name, dist))
    
    distances.sort(key=lambda x: x[1])
    for name, d in distances:
        print(f"{d:.4f} | {name}")
    
    db.close()

if __name__ == "__main__":
    asyncio.run(test_distances())
