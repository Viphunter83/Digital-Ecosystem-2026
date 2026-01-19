import sys
import os
from dotenv import load_dotenv

# Add root to python path
sys.path.append(os.getcwd())
load_dotenv()

# FIX: Force TCP connection
if os.environ.get("DATABASE_URL"):
    os.environ["DATABASE_URL"] = os.environ["DATABASE_URL"].replace("localhost", "127.0.0.1")

from apps.backend.app.core.database import engine
from packages.database.models import Base, SiteContent

def update_schema():
    print("Updating database schema...")
    # This will create tables that do not exist, but won't modify existing ones
    Base.metadata.create_all(bind=engine)
    print("Schema updated successfully.")

if __name__ == "__main__":
    update_schema()
