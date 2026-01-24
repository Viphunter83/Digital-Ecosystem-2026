import os
from sqlalchemy import create_engine, text

database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/digital_ecosystem")
engine = create_engine(database_url)

with engine.connect() as conn:
    print("--- PRODUCTS ---")
    res = conn.execute(text("SELECT id, name, category FROM products LIMIT 20"))
    for row in res:
        print(f"ID: {row[0]}, Name: {row[1]}, Category: {row[2]}")
    
    print("\n--- SPARE PARTS ---")
    res = conn.execute(text("SELECT id, name FROM spare_parts LIMIT 20"))
    for row in res:
        print(f"ID: {row[0]}, Name: {row[1]}")
