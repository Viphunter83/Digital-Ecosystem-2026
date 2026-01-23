import asyncio
import logging
from apps.backend.app.core.database import SessionLocal
from apps.backend.app.services.maintenance_service import MaintenanceService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_check():
    """
    Periodic task to check for upcoming maintenance.
    """
    logger.info("Starting scheduled maintenance check...")
    db = SessionLocal()
    try:
        service = MaintenanceService(db)
        # Check for 30 days ahead
        await service.check_upcoming_maintenance(days_ahead=30)
        logger.info("Maintenance check completed successfully.")
    except Exception as e:
        logger.error(f"Error during maintenance check: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_check())
