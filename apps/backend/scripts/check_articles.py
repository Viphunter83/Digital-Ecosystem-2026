import sys
import os
from sqlalchemy import select

# Ensure apps module is found
sys.path.append(os.getcwd())

from apps.backend.app.core.database import SessionLocal
from packages.database.models import Article

db = SessionLocal()
articles = db.execute(select(Article)).scalars().all()

print(f"Found {len(articles)} articles:")
for a in articles:
    print(f"ID: {a.id}, Title: {a.title}, Image: {a.cover_image}")

db.close()
