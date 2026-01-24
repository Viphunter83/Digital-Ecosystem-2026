from fastapi import APIRouter, Header, HTTPException, Depends
import redis
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
r = redis.from_url(REDIS_URL)

@router.post("/clear-cache")
async def clear_cache(x_webhook_secret: str = Header(None)):
    """
    Endpoint to clear Redis cache. 
    Triggered by Directus Flow when content changes.
    """
    # Simple secret verification
    secret = os.getenv("DIRECTUS_WEBHOOK_SECRET", "rss-secret-2026")
    if x_webhook_secret != secret:
        logger.warning("Unauthorized cache clear attempt")
        raise HTTPException(status_code=401, detail="Invalid secret")

    try:
        # Clear all keys (or specific patterns if needed)
        # Fastapi-cache usually uses a specific prefix, e.g., 'fastapi-cache:'
        keys = r.keys("fastapi-cache:*")
        if keys:
            r.delete(*keys)
            logger.info(f"Cleared {len(keys)} cache keys")
        
        return {"status": "ok", "cleared_keys": len(keys)}
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail="Cache clear failed")

from fastapi import Request
from apps.backend.app.services.amocrm_sync_service import amocrm_sync_service
from apps.backend.app.core.database import get_db
from sqlalchemy.orm import Session

@router.post("/amocrm")
async def amocrm_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle incoming webhooks from AmoCRM.
    Example payload format: leads[status][0][id]=123&leads[status][0][status_id]=142
    AmoCRM sends data as form-urlencoded.
    """
    try:
        # AmoCRM sends data in a weird nested form-urlencoded format
        form_data = await request.form()
        
        # Convert flat form data to nested dict (simplified)
        # In real life, we'd need a more robust parser for amo's [index][key] format
        data = {}
        for key, value in form_data.items():
            parts = key.replace(']', '').split('[')
            d = data
            for part in parts[:-1]:
                if part not in d:
                    d[part] = {}
                d = d[part]
            d[parts[-1]] = value
            
        logger.info(f"Received AmoCRM Webhook: {data}")
        
        # Process in background or synchronously if fast
        await amocrm_sync_service.process_webhook(data, db)
        
        return {"status": "accepted"}
    except Exception as e:
        logger.error(f"Error processing AmoCRM webhook: {e}")
        # Always return 200 to AmoCRM to prevent retries if we don't want them
        return {"status": "error", "message": str(e)}
