import os
import shutil
import logging
from sqlalchemy import select
from apps.backend.app.core.database import SessionLocal
from packages.database.models import SiteContent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def upload_local_catalog(source_path: str, key: str = "catalog_url"):
    """
    Copies a local file to the backend uploads directory and updates the database.
    """
    if not os.path.exists(source_path):
        logger.error(f"Source file not found: {source_path}")
        return

    # 1. Determine paths
    backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    uploads_dir = os.path.join(backend_root, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    filename = os.path.basename(source_path)
    # Standardize name for catalog if needed, or keep original
    dest_path = os.path.join(uploads_dir, filename)

    # 2. Copy file
    try:
        shutil.copy2(source_path, dest_path)
        logger.info(f"✅ File copied to: {dest_path}")
    except Exception as e:
        logger.error(f"❌ Failed to copy file: {e}")
        return

    # 3. Update Database
    db = SessionLocal()
    try:
        # We assume the API serves /uploads/ globally through /api/uploads/ proxy or direct mount
        file_url = f"/api/uploads/{filename}"
        
        stmt = select(SiteContent).where(SiteContent.key == key)
        item = db.execute(stmt).scalar_one_or_none()

        if item:
            item.value = file_url
            item.type = "file"
            logger.info(f"🔄 Updated existing key '{key}' to {file_url}")
        else:
            item = SiteContent(key=key, value=file_url, type="file")
            db.add(item)
            logger.info(f"➕ Created new key '{key}' with value {file_url}")

        db.commit()
        logger.info("✨ Database updated successfully!")
    except Exception as e:
        logger.error(f"❌ Database error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Default: upload the presentation from input materials
    import sys
    
    # Path relative to project root if run from project root, 
    # but here we use a safer absolute check
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    default_source = os.path.join(project_root, "_input_materials", "Prezentacija_Zvezdochka.pdf")
    
    source = sys.argv[1] if len(sys.argv) > 1 else default_source
    
    logger.info(f"Starting upload for: {source}")
    upload_local_catalog(source)
