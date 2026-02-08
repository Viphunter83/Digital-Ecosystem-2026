import logging
import uuid
import json
from sqlalchemy import select
from apps.backend.app.core.database import SessionLocal, engine
from packages.database.models import Product, Project, Article, Client, Base, ClientEquipment, ServiceTicket, MachineInstance
import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_data():
    if os.getenv("ENV") == "production":
        logger.warning("Skipping demo seeding in PRODUCTION environment.")
        return
    db = SessionLocal()
    try:
        # Create Tables if not exist
        logger.info("Ensuring database schema exists...")
        # Enable pgvector extension
        from sqlalchemy import text
        db.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        db.commit()
        
        Base.metadata.create_all(bind=engine)

        # 1. Clients
        if not db.execute(select(Client)).first():
            logger.info("Seeding Clients...")
            client_zio = Client(name="ЗиО-Подольск", inn="5036040000", contact_info={"email": "info@zio.ru"})
            client_lmz = Client(name="Силовые Машины", inn="7804130000", contact_info={"email": "office@power-m.ru"})
            client_mtz = Client(name="МТЗ", inn="1000000000", contact_info={"email": "export@belarus-tractor.com"})
            db.add_all([client_zio, client_lmz, client_mtz])
            db.flush()

        # 2. Products
        if not db.execute(select(Product)).first():
            logger.info("Seeding Products...")
            products_data = [
                {
                    "name": "Токарный обрабатывающий центр 1М63-ЧПУ",
                    "slug": "1m63-cnc",
                    "category": "Turning",
                    "manufacturer": "Рязанский Станкозавод",
                    "description": "Предназначен для токарной обработки наружных и внутренних поверхностей деталей со ступенчатым и криволинейным профилем.",
                    "specs": {"power": "15 kW", "max_diameter": "630 mm", "max_length": "3000 mm", "accuracy": "IT7"},
                    "price": 5200000,
                    "image_url": "/images/products/product_cnc.png"
                },
                # ... other products can be added if needed, but let's keep it minimal for fix
            ]
            for p_data in products_data:
                image_url = p_data.pop("image_url", None)
                product = Product(**p_data)
                db.add(product)
                db.flush()
                if image_url:
                    from packages.database.models import ProductImage
                    img = ProductImage(product_id=product.id, url=image_url, is_primary=True)
                    db.add(img)

        # 3. Machine Instance (ALWAYS CHECK AND SEED)
        logger.info("Verifying MachineInstance CNC-2026-X...")
        lathe = db.execute(select(Product).where(Product.slug == "1m63-cnc")).scalar_one_or_none()
        client_mtz = db.execute(select(Client).where(Client.name == "МТЗ")).scalar_one_or_none()
        
        if lathe and client_mtz:
            instance_exists = db.execute(select(MachineInstance).where(MachineInstance.serial_number == "CNC-2026-X")).scalar_one_or_none()
            if not instance_exists:
                logger.info("Seeding MachineInstance CNC-2026-X...")
                instance = MachineInstance(
                    product_id=lathe.id,
                    client_id=client_mtz.id,
                    serial_number="CNC-2026-X",
                    inventory_number="#992811",
                    status="repair",
                    service_history=[
                        {"date": "15.01.2026", "title": "Заявка принята", "description": "Запрос на капремонт через ТМА", "status": "done", "icon": "CheckCircle2"},
                        {"date": "16.01.2026", "title": "Дефектовка", "description": "Выявлен износ направляющих", "status": "done", "icon": "Wrench"},
                        {"date": "В процессе", "title": "Ремонт", "description": "Шлифовка станины", "status": "active", "icon": "Clock"},
                        {"date": "-", "title": "Готово", "description": "Сдача ОТК", "status": "pending", "icon": "CheckCircle2"}
                    ]
                )
                db.add(instance)
            else:
                logger.info("MachineInstance CNC-2026-X already exists.")
        else:
            logger.warning("Could not find MTZ client or 1M63-CNC product for instance seeding.")

        db.commit()
        logger.info("Successfully seeded demo data!")

    except Exception as e:
        logger.error(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
