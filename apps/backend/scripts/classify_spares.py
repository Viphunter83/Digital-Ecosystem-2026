
import asyncio
import os
import sys
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from apps.backend.app.core.config import settings

DATABASE_URL = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

KEYWORDS = [
    "колесо зубчат", "подшипник", "вал", "винт", "гайка", 
    "муфта", "резцедержатель", "патрон", "каретка", "шпиндель",
    "люнет", "суппорт", "бабка", "нож", "резец", "пластина",
    "втулка", "сальник", "манжета", "пружина", "шайба", "болт",
    "шестерня", "шкив", "ремень", "цепь", "фильтр", "насос",
    "клапан", "датчик", "реле", "пускатель", "контактор",
    "сверло", "фреза", "метчик", "плашка", "развертка",
    "запчаст", "комплектующие", "оснастка"
]

EXCLUDE_KEYWORDS = [
    "станок", "машина", "центр", "пресс", "линия", "комплекс", "пила", "ножницы", "молот"
]

def classify_and_move():
    session = SessionLocal()
    try:
        print("Checking for misclassified products...")
        
        query = text("""
            SELECT id, name, description, specs, price, slug, is_published, created_at, updated_at
            FROM products
            WHERE category = 'Machine'
        """)
        
        products = session.execute(query).fetchall()
        
        moved_count = 0
        
        for p in products:
            name_lower = p.name.lower()
            
            # Special check for direct declaration of Spare Parts (overrides exclusion)
            # Use 'in' instead of 'startswith' because of potential prefixes
            is_definitely_spare = "запасные части" in name_lower or "запчасть" in name_lower or "узлы" in name_lower

            # Check exclusions first (unless it is definitely a spare)
            if not is_definitely_spare and any(exc in name_lower for exc in EXCLUDE_KEYWORDS):
                continue

            # Check if name contains any keyword
            # If it is definitely a spare, we don't need to look for specific keywords
            is_spare = is_definitely_spare or any(k in name_lower for k in KEYWORDS)
            
            if is_spare:
                print(f"Moving to Spares: {p.name} ({p.id})")
                
                # Insert into spare_parts
                specs = dict(p.specs) if p.specs else {}
                if p.description and 'description' not in specs:
                    specs['description'] = p.description
                
                insert_stmt = text("""
                    INSERT INTO spare_parts (id, name, specs, is_published, price)
                    VALUES (:id, :name, :specs, :is_published, :price)
                    ON CONFLICT (id) DO NOTHING
                """)
                
                session.execute(insert_stmt, {
                    "id": p.id,
                    "name": p.name,
                    "specs": json.dumps(specs),
                    "is_published": p.is_published,
                    "price": p.price
                })

                # Move Images
                img_query = text("SELECT id, url FROM product_images WHERE product_id = :pid")
                images = session.execute(img_query, {"pid": p.id}).fetchall()
                
                for img in images:
                    session.execute(text("""
                        INSERT INTO spare_part_images (url, spare_part_id, is_primary)
                        VALUES (:url, :sid, :is_primary)
                    """), {"url": img.url, "sid": p.id, "is_primary": False})

                # Delete from products
                session.execute(text("DELETE FROM product_images WHERE product_id = :pid"), {"pid": p.id})
                session.execute(text("DELETE FROM products WHERE id = :pid"), {"pid": p.id})
                
                moved_count += 1
                
        session.commit()
        print(f"Successfully moved {moved_count} items to Spare Parts.")
        
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    classify_and_move()
