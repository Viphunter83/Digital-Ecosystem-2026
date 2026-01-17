import logging
import uuid
import json
from sqlalchemy import select
from apps.backend.app.core.database import SessionLocal
from packages.database.models import Product, Project, Article, Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_data():
    db = SessionLocal()
    try:
        # Check if data exists
        if db.execute(select(Product)).first():
            logger.info("Database already contains data. Skipping seed.")
            return

        logger.info("Seeding demo data...")

        # 1. Clients
        client_zio = Client(name="ЗиО-Подольск", inn="5036040000", contact_info={"email": "info@zio.ru"})
        client_lmz = Client(name="Силовые Машины", inn="7804130000", contact_info={"email": "office@power-m.ru"})
        client_mtz = Client(name="МТЗ", inn="1000000000", contact_info={"email": "export@belarus-tractor.com"})
        
        db.add_all([client_zio, client_lmz, client_mtz])
        db.flush() # to get IDs

        # 2. Products (Heavy Machinery)
        # 2. Products (Heavy Machinery)
        products_data = [
            {
                "name": "Токарный обрабатывающий центр 1М63-ЧПУ",
                "slug": "1m63-cnc",
                "category": "Turning",
                "manufacturer": "Рязанский Станкозавод",
                "description": "Предназначен для токарной обработки наружных и внутренних поверхностей деталей со ступенчатым и криволинейным профилем.",
                "specs": {"power": "15 kW", "max_diameter": "630 mm", "max_length": "3000 mm", "accuracy": "IT7"},
                "price": 5200000,
                "image_url": "/images/products/lathe.jpg"
            },
            {
                "name": "Вертикально-фрезерный станок 6Р12",
                "slug": "6r12",
                "category": "Milling",
                "manufacturer": "Воткинский Завод",
                "description": "Мощный станок для выполнения операций фрезерования, сверления и растачивания деталей из черных и цветных металлов.",
                "specs": {"table_size": "400x1600 mm", "spindle_speed": "1600 rpm", "travel_x": "1000 mm"},
                "price": 6800000,
                "image_url": None
            },
            {
                "name": "Гидравлический пресс П6330",
                "slug": "p6330",
                "category": "Pressing",
                "manufacturer": "Тяжпрессмаш",
                "description": "Универсальный гидравлический пресс для запрессовки, выпрессовки, правки и гибки.",
                "specs": {"force": "100 ton", "stroke": "500 mm", "speed": "15 mm/s"},
                "price": 3100000,
                "image_url": None
            },
            {
                "name": "Портальный станок с ЧПУ Titan-2026",
                "slug": "titan-2026",
                "category": "Advanced Machining",
                "manufacturer": "СтанкоМашКомплекс",
                "description": "Высокоскоростной портальный станок для обработки крупногабаритных деталей.",
                "specs": {"axis": "5", "workspace": "3000x2000x1000", "spindle": "24000 rpm"},
                "price": 15000000,
                "image_url": None
            },
            {
                "name": "Лазерный комплекс Photon-L",
                "slug": "photon-l",
                "category": "Laser",
                "manufacturer": "IPG Photonics (Rus)",
                "description": "Комплекс лазерной резки металла высокой толщины.",
                "specs": {"laser_power": "6 kW", "table": "1500x3000 mm", "max_thickness": "25 mm"},
                "price": 12500000,
                "image_url": None
            }
        ]

        for p_data in products_data:
            image_url = p_data.pop("image_url", None)
            product = Product(**p_data)
            db.add(product)
            db.flush() # get ID
            
            if image_url:
                from packages.database.models import ProductImage
                img = ProductImage(product_id=product.id, url=image_url, is_primary=True)
                db.add(img)

        # 3. Projects (Map Cases)
        projects = [
            Project(
                client_id=client_zio.id,
                description="Модернизация парка ЧПУ станков для производства теплообменников АЭС.",
                region="Подольск",
                year=2025,
                contract_sum=150000000,
                coordinates={"lat": 55.4312, "lon": 37.5458},
                raw_data={"title": "ЗиО-Подольск: Модернизация"}
            ),
            Project(
                client_id=client_lmz.id,
                description="Капитальный ремонт карусельного станка 1540.",
                region="Санкт-Петербург",
                year=2024,
                contract_sum=45000000,
                coordinates={"lat": 59.9343, "lon": 30.3351},
                raw_data={"title": "Силовые Машины: Капремонт"}
            ),
            Project(
                client_id=client_mtz.id,
                description="Поставка автоматической линии обработки валов.",
                region="Минск",
                year=2025,
                contract_sum=320000000,
                coordinates={"lat": 53.9006, "lon": 27.5590},
                raw_data={"title": "МТЗ: Линия валов"}
            )
        ]
        db.add_all(projects)

        # 4. Articles
        articles = [
            Article(
                title="Как выбрать ЧПУ станок в 2026 году?",
                slug="how-to-choose-cnc-2026",
                content="В 2026 году ключевым фактором становится интеграция с цифровыми экосистемами. AI-ассистенты, предиктивная аналитика и интеграция с ERP...",
                tags=["Technology", "CNC", "Guide"],
                cover_image="/images/blog/cnc-guide.jpg"
            ),
            Article(
                title="Тренды металлообработки: Аддитивные технологии",
                slug="metalworking-trends-2026",
                content="Гибридные станки, совмещающие фрезеровку и 3D-печать металлом, захватывают рынок...",
                tags=["Industry 4.0", "Trends", "Additive"],
                cover_image="/images/blog/additive.jpg"
            )
        ]
        db.add_all(articles)

        db.commit()
        logger.info("Successfully seeded demo data!")

    except Exception as e:
        logger.error(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
