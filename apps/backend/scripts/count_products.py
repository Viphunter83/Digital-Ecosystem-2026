import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def count_products():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not set")
        return

    # Adjust for docker internal network if running from script locally vs inside container
    # But this script is meant to be run inside the backend container
    
    engine = create_async_engine(database_url)
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT COUNT(*) FROM products"))
        count = result.scalar()
        print(f"Total products: {count}")

if __name__ == "__main__":
    asyncio.run(count_products())
