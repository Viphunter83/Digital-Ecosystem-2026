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
