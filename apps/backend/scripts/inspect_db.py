
import os
import sys
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from apps.backend.app.core.config import settings

DATABASE_URL = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def inspect_db():
    session = SessionLocal()
    try:
        # Check Products table content (Offset 100)
        print("--- Items in PRODUCTS table (Offset 100) ---")
        res = session.execute(text("SELECT id, name, category, specs FROM products OFFSET 100 LIMIT 5")).fetchall()
        for r in res:
            print(f"ID: {r.id}, Name: {r.name}, Cat: {r.category}")
            print(f"Specs keys: {list(r.specs.keys()) if r.specs else 'None'}")
            print(f"Specs: {r.specs}") 
            print("-" * 20)

        # Check Spares table content for migrated items (e.g. 'колесо')
        print("\n--- Migrated 'Wheel' items in SPARE_PARTS table ---")
        res = session.execute(text("SELECT id, name, specs FROM spare_parts WHERE name ILIKE '%колесо%' LIMIT 3")).fetchall()
        for r in res:
            print(f"ID: {r.id}, Name: {r.name}")
            print(f"Specs: {r.specs}") 
            if isinstance(r.specs, dict):
                 print(f"Specs keys: {list(r.specs.keys())}")
            print("-" * 20)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    inspect_db()
