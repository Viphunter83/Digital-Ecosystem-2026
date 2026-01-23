"""
AmoCRM Integration for Bot

Minimal client to create leads from Telegram bot requests.
"""

import os
import logging
import aiohttp
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class AmoCRMClient:
    def __init__(self):
        self.subdomain = os.getenv("AMOCRM_SUBDOMAIN", "")
        self.access_token = os.getenv("AMOCRM_ACCESS_TOKEN", "")
        self.pipeline_id = os.getenv("AMOCRM_PIPELINE_ID", "")
        self.base_url = f"https://{self.subdomain}.amocrm.ru/api/v4"
        self.enabled = bool(self.subdomain and self.access_token)

    @property
    def headers(self):
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    async def create_lead(self, name: str, price: int = 0, tags: list = None) -> Optional[int]:
        if not self.enabled:
            logger.info("AmoCRM integration not enabled (missing token/subdomain)")
            return None

        payload = [{
            "name": name,
            "price": price,
        }]
        
        if self.pipeline_id:
            payload[0]["pipeline_id"] = int(self.pipeline_id)
            
        if tags:
            payload[0]["_embedded"] = {"tags": [{"name": t} for t in tags]}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.base_url}/leads", headers=self.headers, json=payload) as resp:
                    if resp.status in (200, 201):
                        data = await resp.json()
                        lead_id = data.get("_embedded", {}).get("leads", [{}])[0].get("id")
                        logger.info(f"AmoCRM lead created: {lead_id}")
                        return lead_id
                    else:
                        text = await resp.text()
                        logger.error(f"AmoCRM error {resp.status}: {text}")
        except Exception as e:
            logger.error(f"AmoCRM request failed: {e}")
        return None

# Singleton
amocrm = AmoCRMClient()
