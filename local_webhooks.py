import hashlib
import requests
import time
import asyncio
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
    # ... (rest of amocrm logic)
    try:
        form_data = await request.form()
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
        await amocrm_sync_service.process_webhook(data, db)
        return {"status": "accepted"}
    except Exception as e:
        logger.error(f"Error processing AmoCRM webhook: {e}")
        return {"status": "error", "message": str(e)}

from apps.backend.app.services.image_service import image_service
from apps.backend.app.core.config import settings
import requests

@router.post("/watermark")
async def watermark_webhook(payload: dict):
    """
    Triggered by Directus Flow after file upload.
    Payload contains the file object.
    """
    try:
        file_id = payload.get("key") or payload.get("id")
        if not file_id:
            logger.warning("No file ID in watermark payload")
            return {"status": "ignored"}

        # Define auth header for Directus requests
        auth_header = {"Authorization": f"Bearer {settings.DIRECTUS_TOKEN}"}

        # 0. Wait for consistency (File system lag / eventual consistency)
        import time
        import asyncio
        # We are in async function, using sync time.sleep is bad for performance but safe for logic here.
        # Ideally await asyncio.sleep(5)
        await asyncio.sleep(5)

        # 1. Fetch file metadata to check type
        # Add no-cache headers
        no_cache_headers = auth_header.copy()
        no_cache_headers.update({'Cache-Control': 'no-cache', 'Pragma': 'no-cache'})

        file_url = f"{settings.DIRECTUS_URL}/files/{file_id}"
        
        file_resp = requests.get(file_url, headers=no_cache_headers)
        file_resp.raise_for_status()
        file_data = file_resp.json().get("data", {})

        mime_type = file_data.get("type", "")
        if not mime_type.startswith("image/"):
            logger.info(f"Skipping non-image file: {mime_type}")
            return {"status": "skipped"}

        # 2. Get original content
        # Add cache buster AND headers
        asset_url = f"{settings.DIRECTUS_URL}/assets/{file_id}?t={int(time.time())}"
        asset_resp = requests.get(asset_url, headers=no_cache_headers)
        asset_resp.raise_for_status()
        
        original_content = asset_resp.content
        current_md5 = hashlib.md5(original_content).hexdigest()
        # 3. Check loop protection
        current_tags = file_data.get("tags") or []
        if not isinstance(current_tags, list):
            current_tags = []

        if f"watermarked_{current_md5}" in current_tags:
            logger.info(f"File {file_id} already has tag for current content. Skipping.")
            return {"status": "skipped", "reason": "already_watermarked"}

        if "watermark_processing" in current_tags:
            logger.info(f"File {file_id} is already being processed. Skipping.")
            return {"status": "skipped", "reason": "processing_lock"}
        
        # 4. Add Watermark
        logger.info(f"Adding watermark to file {file_id}...")
        processed_image = await image_service.add_watermark(original_content)
        new_md5 = hashlib.md5(processed_image).hexdigest()

        # 5. Prepare new tags
        # Add lock and clean old watermarked tags
        new_tags = [t for t in current_tags if not t.startswith("watermarked_")]
        new_tags.append("watermark_processing")
        new_tags.append(f"watermarked_{new_md5}")

        # 6. Apply Lock and Hash (Pre-update)
        logger.info(f"Applying lock and new hash tag to {file_id}")
        lock_resp = requests.patch(file_url, headers=auth_header, json={"tags": new_tags})
        lock_resp.raise_for_status()

        # 7. Update Content
        files = {'file': ('image.jpg', processed_image, 'image/jpeg')}
        logger.info(f"Uploading watermarked content for {file_id}")
        content_resp = requests.patch(file_url, headers=auth_header, files=files)
        content_resp.raise_for_status()

        # 8. Release Lock
        final_tags = [t for t in new_tags if t != "watermark_processing"]
        logger.info(f"Releasing lock for {file_id}")
        requests.patch(file_url, headers=auth_header, json={"tags": final_tags})

        logger.info(f"Successfully watermarked file: {file_id}. Final Hash: {new_md5}")
        return {"status": "ok", "file_id": file_id}

        logger.info(f"Successfully watermarked file: {file_id}. Hash: {new_md5}")
        return {"status": "ok", "file_id": file_id}

    except Exception as e:
        logger.error(f"Watermarking error: {e}")
        # Try to log response text if available
        if hasattr(e, 'response') and e.response is not None:
             logger.error(f"API Response: {e.response.text}")
        return {"status": "error", "message": str(e)}
