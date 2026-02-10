import aiohttp
import logging
import os

logger = logging.getLogger(__name__)

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "https://admin.td-rss.ru")
# Server uses DIRECTUS_TOKEN, local often uses DIRECTUS_STATIC_TOKEN
DIRECTUS_TOKEN = os.getenv("DIRECTUS_STATIC_TOKEN") or os.getenv("DIRECTUS_TOKEN")

async def get_articles(limit: int = 5):
    """Fetch articles from Directus."""
    url = f"{DIRECTUS_URL}/items/articles"
    params = {
        "limit": limit,
        "fields": "id,title,slug,content",
        "sort": "-created_at"
    }
    headers = {}
    if DIRECTUS_TOKEN:
        headers["Authorization"] = f"Bearer {DIRECTUS_TOKEN}"
        
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("data", [])
                else:
                    logger.error(f"Failed to fetch articles: {resp.status}")
                    return []
    except Exception as e:
        logger.error(f"Error fetching articles: {e}")
        return []

async def get_article_by_slug(slug: str):
    """Fetch a single article by slug."""
    url = f"{DIRECTUS_URL}/items/articles"
    params = {
        "filter[slug][_eq]": slug,
        "fields": "id,title,content"
    }
    headers = {}
    if DIRECTUS_TOKEN:
        headers["Authorization"] = f"Bearer {DIRECTUS_TOKEN}"
        
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    articles = data.get("data", [])
                    return articles[0] if articles else None
                else:
                    logger.error(f"Failed to fetch article: {resp.status}")
                    return None
    except Exception as e:
        logger.error(f"Error fetching article: {e}")
        return None
