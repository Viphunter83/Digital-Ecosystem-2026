import sys
import os
import uuid
from datetime import datetime
from sqlalchemy import select

# Ensure apps module is found
sys.path.append(os.getcwd())

from apps.backend.app.core.database import SessionLocal
from packages.database.models import Article

def add_articles():
    db = SessionLocal()
    
    new_articles = [
        Article(
            id=uuid.uuid4(),
            title="Роботизация сварочных процессов: Опыт внедрения",
            slug="robotic-welding-case-2026",
            content="""В условиях дефицита квалифицированных сварщиков, роботизация становится безальтернативным путем развития.
            
            Внедрение робототехнических комплексов FANUC и KUKA на предприятиях тяжелого машиностроения позволило увеличить производительность в 3.5 раза.
            
            Основные проблемы при внедрении:
            1. Подготовка оснастки.
            2. Переобучение персонала.
            3. Интеграция с цифровым двойником изделия.
            
            Окупаемость таких проектов при трехсменной работе составляет 14-18 месяцев.""",
            tags=["Robotics", "Welding", "Case Study"],
            cover_image="/images/journal_robotics.png"
        ),
        Article(
            title="Цифровые двойники в металлургии",
            slug="digital-twins-metallurgy",
            content="""Создание точных цифровых копий прокатных станов позволяет предсказывать аварии за 2 недели до их возникновения.
            
            Использование IoT датчиков вибрации и температуры, объединенных в единую нейросеть, дает полную картину состояния оборудования в реальном времени.
            
            Экономический эффект от внедрения предиктивного обслуживания оценивается в миллиарды рублей ежегодно.""",
            tags=["Digital Twin", "AI", "Metallurgy"],
            cover_image="/images/hero_bg.png"
        )
    ]

    for art in new_articles:
        # Check if exists to avoid dupes on re-run
        exists = db.execute(select(Article).where(Article.title == art.title)).scalar_one_or_none()
        if not exists:
            db.add(art)
            print(f"Added article: {art.title}")
        else:
            print(f"Skipped existing: {art.title}")

    db.commit()
    db.close()

if __name__ == "__main__":
    add_articles()
