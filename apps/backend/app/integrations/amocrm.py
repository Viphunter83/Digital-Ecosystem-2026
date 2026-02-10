"""
AmoCRM Integration Module

This module provides integration with AmoCRM API for:
- Creating leads from service tickets
- Syncing contacts
- Updating deal status

API Documentation: https://www.amocrm.ru/developers/content/crm_platform/api-reference
"""

import os
import logging
from typing import Optional, Dict, Any
import aiohttp
from datetime import datetime, timedelta, timezone

from apps.backend.app.core.config import settings
from apps.backend.app.core.database import SessionLocal
from packages.database.models import AmoCRMSettings

logger = logging.getLogger(__name__)


class AmoCRMClient:
    """Client for AmoCRM API v4 with automated token refresh."""
    
    def __init__(self):
        self.subdomain = settings.AMOCRM_SUBDOMAIN
        self.access_token = settings.AMOCRM_ACCESS_TOKEN
        self.refresh_token = settings.AMOCRM_REFRESH_TOKEN
        self.client_id = settings.AMOCRM_CLIENT_ID
        self.client_secret = settings.AMOCRM_CLIENT_SECRET
        self.redirect_uri = settings.AMOCRM_REDIRECT_URI
        
        self.pipeline_id = settings.AMOCRM_PIPELINE_ID
        self.status_id = settings.AMOCRM_STATUS_ID
        self.responsible_user_id = settings.AMOCRM_RESPONSIBLE_USER_ID
        
        self.base_url = f"https://{self.subdomain}.amocrm.ru/api/v4"
        self.auth_url = f"https://{self.subdomain}.amocrm.ru/oauth2/access_token"
        self.enabled = bool(self.subdomain and (self.access_token or self.refresh_token))
        
        # Cache for tokens in memory to avoid DB hits on every request
        self._tokens_loaded = False
        self._expires_at: Optional[datetime] = None

    async def _ensure_loaded(self):
        """Ensure tokens are loaded from DB or ENV."""
        if self._tokens_loaded:
            return

        db = SessionLocal()
        try:
            db_settings = db.query(AmoCRMSettings).filter(AmoCRMSettings.subdomain == self.subdomain).first()
            if db_settings:
                logger.info("Loaded AmoCRM tokens from database")
                self.access_token = db_settings.access_token
                self.refresh_token = db_settings.refresh_token
                self._expires_at = db_settings.expires_at
            else:
                logger.info("No AmoCRM tokens in DB, using ENV defaults")
                # If no DB entry, we use ENV and will save it on first refresh
                # We don't save yet to avoid creating empty entries if ENV is missing too
                if self.access_token:
                    # Assume 24h for fresh ENV token if not specified
                    self._expires_at = datetime.now(timezone.utc) + timedelta(hours=23)
            
            self._tokens_loaded = True
        finally:
            db.close()

    async def _update_db_tokens(self, access_token: str, refresh_token: str, expires_in_sec: int):
        """Save new tokens to database."""
        db = SessionLocal()
        try:
            self.access_token = access_token
            self.refresh_token = refresh_token
            self._expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in_sec)
            
            db_settings = db.query(AmoCRMSettings).filter(AmoCRMSettings.subdomain == self.subdomain).first()
            if not db_settings:
                db_settings = AmoCRMSettings(subdomain=self.subdomain)
                db.add(db_settings)
            
            db_settings.access_token = access_token
            db_settings.refresh_token = refresh_token
            db_settings.expires_at = self._expires_at
            
            db.commit()
            logger.info("Successfully updated AmoCRM tokens in database")
        except Exception as e:
            logger.error(f"Failed to update AmoCRM tokens in DB: {e}")
            db.rollback()
        finally:
            db.close()

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

    async def _get_headers(self) -> Dict[str, str]:
        """Get headers with an ensured valid token."""
        await self._ensure_loaded()
        
        # Check if nearly expired (within 5 minutes)
        if self._expires_at and datetime.now(timezone.utc) > (self._expires_at - timedelta(minutes=5)):
            logger.info("AmoCRM token is near expiration, refreshing...")
            await self.refresh_auth_token()
            
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

    async def create_lead(
        self,
        name: str,
        price: int = 0,
        custom_fields: Optional[Dict[str, Any]] = None,
        contact_id: Optional[int] = None,
        status_id: Optional[int] = None,
        tags: Optional[list] = None
    ) -> Optional[Dict[str, Any]]:
        """Create a new lead in AmoCRM."""
        payload = [{"name": name, "price": int(price)}]
        
        if self.pipeline_id:
            payload[0]["pipeline_id"] = int(self.pipeline_id)
            
        final_status_id = status_id or self.status_id
        if final_status_id:
            payload[0]["status_id"] = int(final_status_id)

        if self.responsible_user_id:
            payload[0]["responsible_user_id"] = int(self.responsible_user_id)
            
        if custom_fields:
            payload[0]["custom_fields_values"] = [
                {"field_id": int(k), "values": [{"value": v}]}
                for k, v in custom_fields.items() if k
            ]
            
        if contact_id:
            payload[0]["_embedded"] = {"contacts": [{"id": contact_id}]}
            
        if tags:
            payload[0]["_embedded"] = payload[0].get("_embedded", {})
            payload[0]["_embedded"]["tags"] = [{"name": t} for t in tags]
        
        data = await self._request("POST", "leads", json=payload)
        if data and "_embedded" in data:
            lead = data["_embedded"]["leads"][0]
            logger.info(f"Created AmoCRM lead: {lead.get('id')}")
            return lead
        return None
    
    async def add_note(self, entity_type: str, entity_id: int, text: str) -> bool:
        """Add a note to an entity (lead or contact) in AmoCRM."""
        payload = [{
            "entity_id": entity_id,
            "note_type": "common",
            "params": {"text": text}
        }]
        
        data = await self._request("POST", f"{entity_type}/notes", json=payload)
        return data is not None
    
    async def create_contact(
        self,
        name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        telegram_username: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Create a new contact in AmoCRM."""
        custom_fields = []
        if phone:
            custom_fields.append({
                "field_code": "PHONE",
                "values": [{"value": phone, "enum_code": "WORK"}]
            })
        if email:
            custom_fields.append({
                "field_code": "EMAIL",
                "values": [{"value": email, "enum_code": "WORK"}]
            })
            
        payload = [{
            "name": name,
            "custom_fields_values": custom_fields
        }]
        
        if self.responsible_user_id:
            payload[0]["responsible_user_id"] = int(self.responsible_user_id)
        
        data = await self._request("POST", "contacts", json=payload)
        if data and "_embedded" in data:
            contact = data["_embedded"]["contacts"][0]
            logger.info(f"Created AmoCRM contact: {contact.get('id')}")
            return contact
        return None
    
    async def find_contact_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """Find existing contact by phone number."""
        data = await self._request("GET", "contacts", params={"query": phone})
        if data and "_embedded" in data:
            contacts = data["_embedded"]["contacts"]
            return contacts[0] if contacts else None
        return None

    async def update_lead_status(self, lead_id: str, status_id: int) -> bool:
        """Update the status of a lead in AmoCRM."""
        payload = [{"id": int(lead_id), "status_id": status_id}]
        data = await self._request("PATCH", "leads", json=payload)
        return data is not None

    async def update_contact(self, contact_id: int, custom_fields: list) -> bool:
        """Update contact custom fields."""
        payload = [{"id": int(contact_id), "custom_fields_values": custom_fields}]
        data = await self._request("PATCH", "contacts", json=payload)
        return data is not None

    async def get_lead(self, lead_id: int) -> Optional[Dict[str, Any]]:
        """Fetch full lead details including custom fields."""
        return await self._request("GET", f"leads/{lead_id}?with=contacts")


# Singleton instance
amocrm_client = AmoCRMClient()


async def create_lead_from_ticket(
    ticket_number: str,
    serial_number: str,
    ticket_type: str,
    telegram_user_id: int,
    telegram_username: Optional[str] = None
) -> Optional[int]:
    """
    Convenience function to create an AmoCRM lead from a service ticket.
    
    Args:
        ticket_number: Internal ticket ID (e.g., "REQ-ABC123")
        serial_number: Machine serial number
        ticket_type: Type of request ("service", "parts")
        telegram_user_id: User's Telegram ID
        telegram_username: User's Telegram username
        
    Returns:
        AmoCRM lead ID or None
    """
    if not amocrm_client.enabled:
        return None
        
    # Determine lead name based on type
    if ticket_type == "parts":
        name = f"Запчасти: {serial_number} ({ticket_number})"
    else:
        name = f"ТО/Ремонт: {serial_number} ({ticket_number})"
    
    custom_fields = {}
    serial_field_id = os.getenv("AMOCRM_FIELD_SERIAL_ID")
    tg_field_id = os.getenv("AMOCRM_FIELD_TELEGRAM_ID")
    
    if serial_field_id:
        custom_fields[serial_field_id] = serial_number
    if tg_field_id:
        custom_fields[tg_field_id] = str(telegram_user_id)
        
    lead = await amocrm_client.create_lead(
        name=name,
        custom_fields=custom_fields
    )
    
    return lead.get("id") if lead else None
