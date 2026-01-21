import asyncio
import os
import uuid
from datetime import datetime
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker

# Sync version for stability in this context
def seed_spares():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not set")
        return

    print(f"Connecting to DB...")
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    spares_data = [
        {
            "id": "a1b2c3d4-e5f6-4a1b-8c9d-0123456789ab",
            "name": "Шпиндель высокоскоростной HSD 9KW",
            "price": 450000.0,
            "is_published": True,
            "specs": {
                "manufacturer": "HSD",
                "category": "Spindles",
                "status": "in_stock",
                "compatibility": ["Titan-2026", "CNC-Milling"],
                "power": "9kW", 
                "rpm": "24000", 
                "cooling": "air",
                "currency": "RUB",
                "description": "Оригинальный итальянский шпиндель для станков с ЧПУ."
            }
        },
        {
            "id": "b2c3d4e5-f6a1-4b2c-9d0e-1234567890bc",
            "name": "Комплект сервоприводов Yaskawa 750W",
            "price": 125000.0,
            "is_published": True,
            "specs": {
                "manufacturer": "Yaskawa",
                "category": "Drives", 
                "status": "in_stock",
                "compatibility": ["Universal"],
                "power": "750W", 
                "torque": "2.4Nm", 
                "encoder": "20bit",
                "currency": "RUB",
                "description": "Полный комплект (драйвер + мотор + кабели) для одной оси."
            }
        },
        {
            "id": "c3d4e5f6-a1b2-4c3d-0e1f-2345678901cd",
            "name": "Система ЧПУ Fanuc 0i-MF Plus",
            "price": 1200000.0,
            "is_published": True,
            "specs": {
                "manufacturer": "Fanuc",
                "category": "Controllers",
                "status": "on_order",
                "compatibility": ["Milling Centers"],
                "axes": "4", 
                "screen": "10.4 inch", 
                "interface": "I/O Link",
                "currency": "RUB",
                "description": "Современная система управления для фрезерных обрабатывающих центров."
            }
        }
    ]

    try:
        # Check if they exist to avoid unique constraint errors (naive check by ID)
        existing_ids = set()
        result = db.execute(text("SELECT id FROM spare_parts"))
        for row in result:
            existing_ids.add(str(row[0]))

        for item in spares_data:
            if item["id"] not in existing_ids:
                print(f"Inserting {item['name']}...")
                
                # JSON dumps for specs
                import json
                
                # Insert spare part
                sql = text("""
                    INSERT INTO spare_parts (id, name, price, is_published, specs)
                    VALUES (:id, :name, :price, :is_published, :specs)
                """)
                
                db.execute(sql, {
                    "id": item["id"],
                    "name": item["name"],
                    "price": item["price"],
                    "is_published": item["is_published"],
                    "specs": json.dumps(item["specs"])
                })
                
                # Insert mock image
                img_sql = text("""
                    INSERT INTO spare_part_images (id, spare_part_id, url, is_primary, "order")
                    VALUES (:img_id, :pid, :url, :is_primary, :order)
                """)
                db.execute(img_sql, {
                    "img_id": str(uuid.uuid4()),
                    "pid": item["id"],
                    "url": "/images/products/product_cnc.png", # placeholder
                    "is_primary": True,
                    "order": 1
                })
        
        db.commit()
        print("Seeding spare parts completed.")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_spares()
