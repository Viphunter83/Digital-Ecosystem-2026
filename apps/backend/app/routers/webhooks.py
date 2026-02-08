from fastapi import APIRouter, Header, HTTPException, Depends, Request, BackgroundTasks
import redis
import os
import logging
import hashlib
import requests
import time
import asyncio
from apps.backend.app.services.image_service import image_service
from apps.backend.app.core.config import settings

router = APIRouter()
logger = logging.getLogger("uvicorn")

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

async def process_watermark_task(file_id: str):
    """
    Background task to process watermark for a file with Redis locking.
    """
    lock_key = f"processing_watermark:{file_id}"
    try:
        # 1. Check if already processing by another task
        if r.get(lock_key):
            logger.info(f"Background: File {file_id} is already being processed by another task. Skipping.")
            return

        # 2. Set lock with 60s expiration
        r.setex(lock_key, 60, "true")
        
        logger.info(f"Background: Starting watermark processing for {file_id}")
        auth_header = {"Authorization": f"Bearer {settings.DIRECTUS_TOKEN}"}

        # 0. Wait for consistency
        await asyncio.sleep(2)

        # 1. Fetch file metadata
        no_cache_headers = auth_header.copy()
        no_cache_headers.update({'Cache-Control': 'no-cache', 'Pragma': 'no-cache'})
        file_url = f"{settings.DIRECTUS_URL}/files/{file_id}"
        
        file_resp = requests.get(file_url, headers=no_cache_headers)
        file_resp.raise_for_status()
        file_data = file_resp.json().get("data", {})

        mime_type = file_data.get("type", "")
        if not mime_type or not mime_type.startswith("image/"):
            logger.info(f"Background: Skipping non-image file: {mime_type}")
            r.delete(lock_key)
            return

        # 2. Get original content
        asset_url = f"{settings.DIRECTUS_URL}/assets/{file_id}?t={int(time.time())}"
        asset_resp = requests.get(asset_url, headers=no_cache_headers)
        asset_resp.raise_for_status()
        
        original_content = asset_resp.content
        current_md5 = hashlib.md5(original_content).hexdigest()
        
        # 3. Check loop protection tags
        current_tags = file_data.get("tags") or []
        if f"watermarked_{current_md5}" in current_tags:
            logger.info(f"Background: File {file_id} already has tag for current content. Skipping.")
            r.delete(lock_key)
            return

        # 4. Add Watermark
        logger.info(f"Background: Adding watermark to file {file_id}...")
        processed_image = await image_service.add_watermark(original_content)
        new_md5 = hashlib.md5(processed_image).hexdigest()

        # 5. Prepare new tags
        new_tags = [t for t in current_tags if not t.startswith("watermarked_")]
        new_tags.append(f"watermarked_{new_md5}")

        # 6. Apply Hash Tag
        logger.info(f"Background: Applying new hash tag to {file_id}")
        requests.patch(file_url, headers=auth_header, json={"tags": new_tags})

        # 7. Update Content
        binary_headers = auth_header.copy()
        binary_headers['Content-Type'] = 'image/jpeg'
        logger.info(f"Background: Uploading watermarked content (binary) for {file_id}")
        content_resp = requests.patch(file_url, headers=binary_headers, data=processed_image)
        content_resp.raise_for_status()

        logger.info(f"Background: Successfully watermarked file: {file_id}. Final Hash: {new_md5}")

    except Exception as e:
        logger.error(f"Background: Watermarking error for {file_id}: {e}")
    finally:
        # Always release the lock
        r.delete(lock_key)

@router.post("/watermark")
async def watermark_webhook(payload: dict, background_tasks: BackgroundTasks):
    """
    Triggered by Directus Flow after file upload.
    Returns immediately and processes in background.
    """
    try:
        file_id = payload.get("key") or payload.get("id")
        if not file_id and payload.get("keys") and isinstance(payload.get("keys"), list):
            file_id = payload.get("keys")[0]

        if not file_id:
            logger.warning(f"No file ID in watermark payload: {payload}")
            return {"status": "error_no_id", "message": "No file ID provided"}

        if r.get(f"processing_watermark:{file_id}"):
            logger.info(f"Watermark Webhook: File {file_id} is already being processed. Skipping webhook trigger.")
            return {"status": "skipped", "message": "Already processing"}

        logger.info(f"Watermark Webhook: Initiating background task for file_id: {file_id}")
        background_tasks.add_task(process_watermark_task, file_id)
        
        return {"status": "accepted", "file_id": file_id}

    except Exception as e:
        logger.error(f"Webhook entry error: {e}")
        return {"status": "error", "message": str(e)}


@router.post("/gallery-watermark")
async def gallery_watermark_webhook(payload: dict, background_tasks: BackgroundTasks):
    """
    Triggered by Directus Flow when a gallery item (product_images/spare_part_images) is created/updated.
    Fetches the image_file from the gallery record and applies watermark.
    
    This handles the case when users select existing files from the library
    instead of uploading new files.
    """
    try:
        logger.info(f"Gallery Watermark Webhook received: {payload}")
        
        # Extract collection and item key from Directus event payload
        collection = payload.get("collection")
        key = payload.get("key") or payload.get("keys", [None])[0]
        
        if not collection or not key:
            logger.warning(f"Gallery Watermark: Missing collection or key in payload: {payload}")
            return {"status": "skipped", "message": "Missing collection or key"}
        
        # Only process gallery collections
        if collection not in ["product_images", "spare_part_images"]:
            logger.info(f"Gallery Watermark: Skipping non-gallery collection: {collection}")
            return {"status": "skipped", "message": f"Not a gallery collection: {collection}"}
        
        # Fetch the gallery item to get image_file
        auth_header = {"Authorization": f"Bearer {settings.DIRECTUS_TOKEN}"}
        item_url = f"{settings.DIRECTUS_URL}/items/{collection}/{key}?fields=image_file"
        
        item_resp = requests.get(item_url, headers=auth_header)
        if item_resp.status_code != 200:
            logger.warning(f"Gallery Watermark: Failed to fetch item {collection}/{key}: {item_resp.status_code}")
            return {"status": "error", "message": f"Failed to fetch item: {item_resp.status_code}"}
        
        item_data = item_resp.json().get("data", {})
        file_id = item_data.get("image_file")
        
        if not file_id:
            logger.info(f"Gallery Watermark: No image_file in {collection}/{key}")
            return {"status": "skipped", "message": "No image_file in gallery item"}
        
        logger.info(f"Gallery Watermark: Found image_file {file_id} in {collection}/{key}")
        background_tasks.add_task(process_watermark_task, file_id)
        
        return {"status": "accepted", "collection": collection, "item_key": key, "file_id": file_id}

    except Exception as e:
        logger.error(f"Gallery Watermark Webhook error: {e}")
        return {"status": "error", "message": str(e)}
@router.post("/item-watermark")
async def item_watermark_webhook(payload: dict, background_tasks: BackgroundTasks):
    """
    Generic webhook for primary image fields (e.g. products.image_file).
    Triggered when an item is created or updated.
    """
    try:
        logger.info(f"Item Watermark Webhook received: {payload}")
        collection = payload.get("collection")
        key = payload.get("key") or payload.get("keys", [None])[0]
        
        if not collection or not key:
            return {"status": "skipped", "message": "Missing collection or key"}

        # Fetch the item to get image_file
        # Note: We assume the field is named 'image_file' which is standard in this project
        auth_header = {"Authorization": f"Bearer {settings.DIRECTUS_TOKEN}"}
        item_url = f"{settings.DIRECTUS_URL}/items/{collection}/{key}?fields=image_file"
        
        item_resp = requests.get(item_url, headers=auth_header)
        if item_resp.status_code != 200:
            return {"status": "error", "message": f"Failed to fetch item: {item_resp.status_code}"}
        
        item_data = item_resp.json().get("data", {})
        file_id = item_data.get("image_file")
        
        if not file_id:
            return {"status": "skipped", "message": "No image_file in item"}
        
        logger.info(f"Item Watermark: Found image_file {file_id} in {collection}/{key}")
        background_tasks.add_task(process_watermark_task, file_id)
        
        return {"status": "accepted", "collection": collection, "item_key": key, "file_id": file_id}

    except Exception as e:
        logger.error(f"Item Watermark Webhook error: {e}")
        return {"status": "error", "message": str(e)}
