import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config
DATABASE_URL = os.getenv("DATABASE_URL")
MIGRATIONS_DIR = "/app/packages/database/migrations"

def apply_migrations():
    if not DATABASE_URL:
        logger.error("DATABASE_URL is not set.")
        return

    # Use a sync engine for migrations
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Create history table
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS _migrations_history (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                applied_at TIMESTAMP DEFAULT NOW()
            );
        """))
        session.commit()

        # Get applied migrations
        applied = {row[0] for row in session.execute(text("SELECT name FROM _migrations_history")).fetchall()}
        
        # List files
        files = sorted([f for f in os.listdir(MIGRATIONS_DIR) if f.endswith(".sql")])
        
        for filename in files:
            if filename in applied:
                continue
                
            logger.info(f"Applying migration: {filename}")
            
            with open(os.path.join(MIGRATIONS_DIR, filename), "r") as f:
                sql_content = f.read()
                
            # Split by simple delimiter if necessary, or execute as block.
            # Supabase migrations often contain complex blocks ($$), so executing as one text block is safer 
            # if we trust the driver to handle it.
            # We assume the user writes valid SQL that can be executed.
            try:
                session.execute(text(sql_content))
                session.execute(text("INSERT INTO _migrations_history (name) VALUES (:name)"), {"name": filename})
                session.commit()
                logger.info(f"✅ Applied {filename}")
            except Exception as e:
                logger.error(f"❌ Failed to apply {filename}: {e}")
                session.rollback()
                raise e

    except Exception as e:
        logger.error(f"Migration error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    apply_migrations()
