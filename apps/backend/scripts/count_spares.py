import os
from sqlalchemy import text, create_engine

def count_spares():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not set")
        return

    # Ensure sync driver
    # output of previous error said: "The loaded 'psycopg2' is not async." so it IS loaded.
    
    engine = create_engine(database_url)
    with engine.connect() as conn:
        try:
            result = conn.execute(text("SELECT COUNT(*) FROM spare_parts"))
            count = result.scalar()
            print(f"Total spare parts: {count}")
        except Exception as e:
            print(f"Error checking spare_parts: {e}")

if __name__ == "__main__":
    count_spares()
