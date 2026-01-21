import json
import sys
import os
import logging
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

sys.path.append(os.getcwd())
from packages.database.models import Product

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Standard Keys (Lowercase for comparison)
STANDARD_KEYS = {
    'travel_x', 'table_size', 'spindle_speed', 'force', 'speed', 'stroke', 
    'power', 'accuracy', 'max_length', 'max_diameter', 'diameter', 
    'weight', 'axis', 'spindle', 'workspace', 'main', 'model', 'description', 
    'table', 'laser_power', 'max_thickness' # Added from inspection
}

PREFIXES_TO_CHECK = ["ТД РУССтанкоСбыт", "td russtankosbyt"]

def run_audit():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found.")
        return

    # Force sync driver if needed, usually defaults to psycopg2
    if "postgresql+asyncpg" in db_url:
        db_url = db_url.replace("postgresql+asyncpg", "postgresql")
    
    if "localhost" in db_url:
        db_url = db_url.replace("localhost", "127.0.0.1")
    
    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)

    report = {
        "total_products": 0,
        "bad_names": [],
        "few_specs": [],
        "unknown_specs": [],
        "no_category": [],
        "compliant_count": 0
    }

    session = Session()
    try:
        logger.info("Starting Product Card Compliance Check...")
        
        # Sync query
        stmt = select(Product)
        products = session.execute(stmt).scalars().all()
        report["total_products"] = len(products)

        for p in products:
            is_bad = False
            name = p.name or ""
            name_lower = name.lower()
            specs = p.specs or {}
            keys_lower = set(k.lower() for k in specs.keys())

            # 1. Name Check
            if any(prefix.lower() in name_lower for prefix in PREFIXES_TO_CHECK):
                report["bad_names"].append({"id": str(p.id), "name": name, "reason": "Company prefix found"})
                is_bad = True

            # 2. Specs Count
            # We want at least 3 displayable specs (excluding description)
            displayable_keys = [k for k in keys_lower if k != 'description' and k != 'main' and k != 'model']
            
            # Note: Spares often have FEWER specs (just main/model/desc). We shouldn't fail them if they are spares?
            # User wants "Perfect Card" but didn't specify if Spares count. 
            # Spares usually have Category=None or "Spare Parts".
            # For now, flag them.
            if len(displayable_keys) < 3:
                report["few_specs"].append({"id": str(p.id), "name": name, "count": len(displayable_keys), "keys": list(keys_lower)})
                is_bad = True

            # 3. Unknown Specs
            unknown = [k for k in keys_lower if k not in STANDARD_KEYS]
            if unknown:
                report["unknown_specs"].append({"id": str(p.id), "name": name, "unknown_keys": unknown})
                # Don't fail compliance strictly on unknown keys yet, but track it
                # is_bad = True 

            # 4. Category
            if not p.category:
                report["no_category"].append({"id": str(p.id), "name": name})
                is_bad = True

            if not is_bad:
                report["compliant_count"] += 1
            
        # Save Report
        with open("card_compliance_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print("\n" + "="*40)
        print("📊 COMPLIANCE SUMMARY")
        print("="*40)
        print(f"Total Products:     {report['total_products']}")
        print(f"Bad Names (Prefix): {len(report['bad_names'])}")
        print(f"Few Specs (<3):     {len(report['few_specs'])}")
        print(f"Unknown keys:       {len(report['unknown_specs'])} (products with at least 1)")
        print(f"No Category:        {len(report['no_category'])}")
        print("-" * 40)
        print(f"✅ FULLY COMPLIANT:  {report['compliant_count']} / {report['total_products']}")
        print("="*40)

    except Exception as e:
        logger.error(f"Error during audit: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    run_audit()
