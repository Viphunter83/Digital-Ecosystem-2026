import json
import logging
from functools import wraps
from typing import Callable, Optional
import redis.asyncio as redis

from apps.backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Single Redis pool
redis_client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

def cache(expire: int = 60):
    """
    Async cache decorator for FastAPI endpoints.
    Keys are generated based on function name and **kwargs.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 1. Generate Key
            # We skip 'request', 'db', 'user' args for key generation to keep it pure
            # Simple approach: use path params and query params from kwargs
            key_parts = [func.__name__]
            for k, v in sorted(kwargs.items()):
                if k not in ['db', 'current_user', 'request']:
                    key_parts.append(f"{k}={v}")
            
            cache_key = ":".join(key_parts)
            
            # 2. Try Get from Cache
            try:
                cached_val = await redis_client.get(cache_key)
                if cached_val:
                    # logger.info(f"Cache HIT: {cache_key}")
                    return json.loads(cached_val)
            except Exception as e:
                logger.error(f"Redis Error (Get): {e}")

            # 3. Call Original Function
            result = await func(*args, **kwargs)
            
            # 4. Save to Cache
            # 4. Save to Cache
            try:
                # Use FastAPI's jsonable_encoder to safely convert Pydantic models, UUIDs, datetimes
                from fastapi.encoders import jsonable_encoder
                to_cache = jsonable_encoder(result)
                
                await redis_client.set(cache_key, json.dumps(to_cache), ex=expire)
            except Exception as e:
                logger.error(f"Redis Error (Set): {e}")
                
            return result
        return wrapper
    return decorator
