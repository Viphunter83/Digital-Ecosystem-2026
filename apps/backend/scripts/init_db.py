from sqlalchemy import create_engine
from sqlalchemy.orm import Session
import os
import sys

# Add packages to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))

from packages.database.models import Base, Project, Client
# Default to localhost for local script execution with 'apple' user
DB_URL = os.getenv("DATABASE_URL", "postgresql://apple@localhost:5432/digital_ecosystem") # no password usually for local user

def init_db():
    # Create DB if not exists (using default postgres DB to connect first)
    from sqlalchemy import text
    try:
        # Connect to 'postgres' db to check/create target db
        admin_url = "postgresql://apple@localhost:5432/postgres"
        admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
        with admin_engine.connect() as conn:
            # Check if db exists
            result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = 'digital_ecosystem'"))
            if not result.scalar():
                print("Database 'digital_ecosystem' does not exist. Creating...")
                conn.execute(text("CREATE DATABASE digital_ecosystem"))
                print("Database created.")
            
            # Enable pgvector in the target database
            # We must connect to the target DB to do this
            
    except Exception as e:
        print(f"Warning during DB creation check: {e}") 

    print(f"Connecting to database at {DB_URL}")
    engine = create_engine(DB_URL)

    # Ensure pgvector is enabled - SKIPPED (Not installed locally)
    # with engine.connect() as conn:
    #     conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    #     conn.commit()
    
    print("Creating tables...")
    Base.metadata.create_all(engine)
    
    print("Seeding initial data...")
    with Session(engine) as session:
        # Check if we have data
        if session.query(Project).count() > 0:
            print("Data already exists, skipping seed.")
            return

        # Create Client
        client = Client(
            name="Industrial Holidings LLC",
            inn="7701234567"
        )
        session.add(client)
        session.flush()

        # Create Projects
        p1 = Project(
            client_id=client.id,
            contract_number="CN-2025-001",
            year=2025,
            contract_sum=5000000,
            description="Modernization of assembly line A",
            region="Moscow Region",
            coordinates={"lat": 55.7558, "lon": 37.6173}
        )
        
        p2 = Project(
            client_id=client.id,
            contract_number="CN-2024-042",
            year=2024,
            contract_sum=12000000,
            description="Turnkey power plant construction",
            region="Kazan",
            coordinates={"lat": 55.7961, "lon": 49.1064}
        )

        session.add_all([p1, p2])
        session.commit()
        print("Database initialized and seeded successfully.")

if __name__ == "__main__":
    init_db()
