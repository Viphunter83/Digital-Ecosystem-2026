
import json
import os
import sys
import uuid
from datetime import datetime
from sqlalchemy import create_engine, text

# Database Configuration
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_DB = os.getenv("POSTGRES_DB", "russtanko")
DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@db:5432/{POSTGRES_DB}")

print(f"Connecting to DB: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

DATA_FILE = "/app/scraped_data_v1.json"

def restore_data():
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found.")
        return

    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    print(f"Loaded {len(data)} items from {DATA_FILE}")
    types = {}
    for i in data:
        t = i.get("type", "unknown")
        types[t] = types.get(t, 0) + 1
    print(f"Type breakdown: {types}")

    with engine.connect() as conn:
        for item in data:
            try:
                item_type = item.get("type")
                name = item.get("name")
                slug = item.get("slug")
                description = item.get("description")
                specs = json.dumps(item.get("specs", {}))
                
                # Check for duplicate by slug/name to avoid unique constraint errors?
                # For now, let's just use INSERT ON CONFLICT DO NOTHING or checks.
                # Since slugs might be empty in some json lines (I saw "slug": "" in view_file), generate one if missing.
                
                if not slug:
                    slug = str(uuid.uuid4())

                if item_type == "machine":
                    # Check existence and handle duplicates by appending suffix
                    existing = conn.execute(text("SELECT id FROM products WHERE slug = :slug"), {"slug": slug}).fetchone()
                    if existing:
                        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
                        
                    print(f"Inserting MACHINE: {name} (Slug: {slug})")
                    # Use 'specs' instead of 'specifications'
                    # Also need to provide 'category' as it is nullable=False in model but I didn't verify if json has it.
                    # Json dump "type": "machine" is not the category.
                    # Let's see if json has category.
                    # If not, use "Uncategorized" or "Machine"
                    category = item.get("category", "Machine")

                    conn.execute(text("""
                        INSERT INTO products (id, name, slug, description, specs, category, is_published, created_at, updated_at)
                        VALUES (:id, :name, :slug, :description, :specs, :category, :is_published, :created_at, :updated_at)
                    """), {
                        "id": str(uuid.uuid4()),
                        "name": name,
                        "slug": slug,
                        "description": description,
                        "specs": specs,
                        "category": category, # Added category
                        "is_published": True,
                        "created_at": datetime.now(),
                        "updated_at": datetime.now()
                    })
                    conn.commit()

                elif item_type == "spare_part":
                    # Check existence
                    # Spare parts don't necessarily have slugs in the current schema (id is primary).
                    # But we can check by name.
                    existing = conn.execute(text("SELECT id FROM spare_parts WHERE name = :name"), {"name": name}).fetchone()
                    if existing:
                        print(f"Skipping existing spare: {name}")
                        continue
                    
                    if description:
                        # Append description to specs as it's not a column
                        item_specs = item.get("specs", {})
                        if isinstance(item_specs, str):
                           try:
                               item_specs = json.loads(item_specs)
                           except:
                               item_specs = {}
                        item_specs["description"] = description
                        specs = json.dumps(item_specs)

                    print(f"Inserting SPARE: {name}")
                    conn.execute(text("""
                        INSERT INTO spare_parts (id, name, specs, is_published, price)
                        VALUES (:id, :name, :specs, :is_published, :price)
                    """), {
                        "id": str(uuid.uuid4()),
                        "name": name,
                        "specs": specs,
                        "is_published": True,
                        "price": 0, # Default
                    })
                    conn.commit()

            except Exception as e:
                print(f"Failed to insert item {item.get('name')}: {e}")
                conn.rollback() 
                
    print("Restore complete.")

if __name__ == "__main__":
    restore_data()
