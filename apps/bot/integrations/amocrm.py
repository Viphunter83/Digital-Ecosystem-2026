import os
import logging
import aiohttp
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, update
from packages.database.models import AmoCRMSettings
from apps.bot.database import AsyncSessionLocal

logger = logging.getLogger(__name__)

class AmoCRMClient:
    def __init__(self):
        self.subdomain = os.getenv("AMOCRM_SUBDOMAIN", "")
        self.access_token = os.getenv("AMOCRM_ACCESS_TOKEN", "")
        self.refresh_token = os.getenv("AMOCRM_REFRESH_TOKEN", "")
        self.client_id = os.getenv("AMOCRM_CLIENT_ID", "")
        self.client_secret = os.getenv("AMOCRM_CLIENT_SECRET", "")
        self.redirect_uri = os.getenv("AMOCRM_REDIRECT_URI", "")
        
        self.pipeline_id = os.getenv("AMOCRM_PIPELINE_ID", "")
        
        self.base_url = f"https://{self.subdomain}.amocrm.ru/api/v4"
        self.auth_url = f"https://{self.subdomain}.amocrm.ru/oauth2/access_token"
        
        # We are enabled if we have basic configs
        self.enabled = bool(self.subdomain and (self.access_token or self.refresh_token))
        
        # Cache for tokens in memory
        self._tokens_loaded = False
        self._expires_at: Optional[datetime] = None

    async def _ensure_loaded(self):
        """Lazy load tokens from DB if not already loaded or expired."""
        if self._tokens_loaded and self._expires_at and self._expires_at > datetime.now(timezone.utc):
            return

        async with AsyncSessionLocal() as session:
            stmt = select(AmoCRMSettings).where(AmoCRMSettings.subdomain == self.subdomain)
            result = await session.execute(stmt)
            settings = result.scalar_one_or_none()
            
            if settings:
                self.access_token = settings.access_token
                self.refresh_token = settings.refresh_token
                self._expires_at = settings.expires_at
                self._tokens_loaded = True
                logger.info("AmoCRM tokens loaded from database")
            elif self.access_token or self.refresh_token:
                # Seed DB from env if empty
                logger.info("Seeding AmoCRM tokens from environment to database")
                new_settings = AmoCRMSettings(
                    subdomain=self.subdomain,
                    access_token=self.access_token,
                    refresh_token=self.refresh_token,
                    expires_at=datetime.now(timezone.utc) + timedelta(hours=24) # Initial guess
                )
                session.add(new_settings)
                await session.commit()
                self._tokens_loaded = True

    async def _update_db_tokens(self, access_token: str, refresh_token: str, expires_in: int):
        """Update tokens in the database after refresh."""
        self.access_token = access_token
        self.refresh_token = refresh_token
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        self._expires_at = expires_at

        async with AsyncSessionLocal() as session:
            stmt = update(AmoCRMSettings).where(AmoCRMSettings.subdomain == self.subdomain).values(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_at=expires_at,
                updated_at=datetime.now(timezone.utc)
            )
            await session.execute(stmt)
            await session.commit()
        
        self._tokens_loaded = True
        logger.info("AmoCRM tokens updated in database successfully")

    async def refresh_auth_token(self) -> bool:
        """Refresh the access token using the refresh token."""
        if not self.refresh_token or not self.client_id or not self.client_secret:
            logger.error("AmoCRM refresh failed: Missing refresh_token, client_id or client_secret")
            return False

        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "refresh_token",
            "refresh_token": self.refresh_token,
            "redirect_uri": self.redirect_uri
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.auth_url, json=payload) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        await self._update_db_tokens(
                            data["access_token"],
                            data["refresh_token"],
                            data["expires_in"]
                        )
                        return True
                    else:
                        error_text = await resp.text()
                        logger.error(f"AmoCRM token refresh error: {resp.status} - {error_text}")
                        return False
        except Exception as e:
            logger.error(f"AmoCRM token refresh exception: {e}")
            return False

    async def _get_headers(self):
        await self._ensure_loaded()
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    async def _request(self, method: str, path: str, **kwargs) -> Optional[Dict[str, Any]]:
        """Internal helper for making authorized requests with auto-retry on 401."""
        if not self.enabled:
            logger.warning("AmoCRM integration is not configured")
            return None

        url = f"{self.base_url}/{path}"
        headers = await self._get_headers()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(method, url, headers=headers, **kwargs) as resp:
                    if resp.status == 401:
                        logger.warning("AmoCRM returned 401, attempting token refresh...")
                        if await self.refresh_auth_token():
                            # Retry once with new token
                            headers = await self._get_headers()
                            async with session.request(method, url, headers=headers, **kwargs) as retry_resp:
                                if retry_resp.status in (200, 201, 204):
                                    return await retry_resp.json() if retry_resp.status != 204 else {"success": True}
                                error_text = await retry_resp.text()
                                logger.error(f"AmoCRM API error (retry {method} {path}): {retry_resp.status} - {error_text}")
                                return None
                        return None
                    
                    if resp.status in (200, 201, 204):
                        if resp.status == 204:
                            return {"success": True}
                        return await resp.json()
                    else:
                        error_text = await resp.text()
                        logger.error(f"AmoCRM API error ({method} {path}): {resp.status} - {error_text}")
                        return None
        except Exception as e:
            logger.error(f"AmoCRM request exception ({method} {path}): {e}")
            return None

    async def create_lead(self, name: str, price: int = 0, tags: list = None) -> Optional[int]:
        payload = [{
            "name": name,
            "price": price,
        }]
        
        if self.pipeline_id:
            payload[0]["pipeline_id"] = int(self.pipeline_id)
            
        if tags:
            payload[0]["_embedded"] = {"tags": [{"name": t} for t in tags]}

        data = await self._request("POST", "leads", json=payload)
        if data and "_embedded" in data:
            lead_id = data["_embedded"]["leads"][0]["id"]
            logger.info(f"AmoCRM lead created: {lead_id}")
            return lead_id
        return None

# Singleton
amocrm = AmoCRMClient()
