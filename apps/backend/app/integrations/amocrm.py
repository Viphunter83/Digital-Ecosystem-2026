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

logger = logging.getLogger(__name__)


class AmoCRMClient:
    """Client for AmoCRM API v4."""
    
    def __init__(self):
        self.subdomain = os.getenv("AMOCRM_SUBDOMAIN", "")
        self.access_token = os.getenv("AMOCRM_ACCESS_TOKEN", "")
        self.pipeline_id = os.getenv("AMOCRM_PIPELINE_ID", "")
        self.responsible_user_id = os.getenv("AMOCRM_RESPONSIBLE_USER_ID", "")
        
        self.base_url = f"https://{self.subdomain}.amocrm.ru/api/v4"
        self.enabled = bool(self.subdomain and self.access_token)
        
    @property
    def headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    async def create_lead(
        self,
        name: str,
        price: int = 0,
        custom_fields: Optional[Dict[str, Any]] = None,
        contact_id: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new lead in AmoCRM.
        
        Args:
            name: Lead name (e.g., "Заявка на ТО: CNC-2026-X")
            price: Expected deal value
            custom_fields: Additional custom field values
            contact_id: ID of associated contact
            
        Returns:
            Created lead data or None on error
        """
        if not self.enabled:
            logger.warning("AmoCRM integration is not configured")
            return None
            
        payload = [
            {
                "name": name,
                "price": price,
            }
        ]
        
        if self.pipeline_id:
            payload[0]["pipeline_id"] = int(self.pipeline_id)
            
        if self.responsible_user_id:
            payload[0]["responsible_user_id"] = int(self.responsible_user_id)
            
        if custom_fields:
            payload[0]["custom_fields_values"] = [
                {"field_id": k, "values": [{"value": v}]}
                for k, v in custom_fields.items()
            ]
            
        if contact_id:
            payload[0]["_embedded"] = {
                "contacts": [{"id": contact_id}]
            }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/leads",
                    headers=self.headers,
                    json=payload
                ) as resp:
                    if resp.status in (200, 201):
                        data = await resp.json()
                        lead = data.get("_embedded", {}).get("leads", [{}])[0]
                        logger.info(f"Created AmoCRM lead: {lead.get('id')}")
                        return lead
                    else:
                        error = await resp.text()
                        logger.error(f"AmoCRM create_lead error: {resp.status} - {error}")
                        return None
        except Exception as e:
            logger.error(f"AmoCRM connection error: {e}")
            return None
    
    async def create_contact(
        self,
        name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        telegram_username: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new contact in AmoCRM.
        
        Args:
            name: Contact name
            phone: Phone number
            email: Email address
            telegram_username: Telegram username
            
        Returns:
            Created contact data or None on error
        """
        if not self.enabled:
            logger.warning("AmoCRM integration is not configured")
            return None
            
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
            
        payload = [
            {
                "name": name,
                "custom_fields_values": custom_fields
            }
        ]
        
        if self.responsible_user_id:
            payload[0]["responsible_user_id"] = int(self.responsible_user_id)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/contacts",
                    headers=self.headers,
                    json=payload
                ) as resp:
                    if resp.status in (200, 201):
                        data = await resp.json()
                        contact = data.get("_embedded", {}).get("contacts", [{}])[0]
                        logger.info(f"Created AmoCRM contact: {contact.get('id')}")
                        return contact
                    else:
                        error = await resp.text()
                        logger.error(f"AmoCRM create_contact error: {resp.status} - {error}")
                        return None
        except Exception as e:
            logger.error(f"AmoCRM connection error: {e}")
            return None
    
    async def find_contact_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """
        Find existing contact by phone number.
        
        Args:
            phone: Phone number to search
            
        Returns:
            Contact data or None if not found
        """
        if not self.enabled:
            return None
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/contacts",
                    headers=self.headers,
                    params={"query": phone}
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        contacts = data.get("_embedded", {}).get("contacts", [])
                        return contacts[0] if contacts else None
                    return None
        except Exception as e:
            logger.error(f"AmoCRM search error: {e}")
            return None


    async def update_lead_status(self, lead_id: str, status_id: int) -> bool:
        """Update the status of a lead in AmoCRM."""
        if not self.enabled:
            return False
            
        payload = [
            {
                "id": int(lead_id),
                "status_id": status_id
            }
        ]
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.patch(
                    f"{self.base_url}/leads",
                    headers=self.headers,
                    json=payload
                ) as resp:
                    return resp.status in (200, 204)
        except Exception as e:
            logger.error(f"AmoCRM update_lead_status error: {e}")
            return False

    async def update_contact(self, contact_id: int, custom_fields: list) -> bool:
        """Update contact custom fields."""
        if not self.enabled:
            return False
            
        payload = [
            {
                "id": contact_id,
                "custom_fields_values": custom_fields
            }
        ]
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.patch(
                    f"{self.base_url}/contacts",
                    headers=self.headers,
                    json=payload
                ) as resp:
                    return resp.status in (200, 204)
        except Exception as e:
            logger.error(f"AmoCRM update_contact error: {e}")
            return False

    async def get_lead(self, lead_id: int) -> Optional[Dict[str, Any]]:
        """Fetch full lead details including custom fields."""
        if not self.enabled:
            return None
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/leads/{lead_id}?with=contacts",
                    headers=self.headers
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    return None
        except Exception as e:
            logger.error(f"AmoCRM get_lead error: {e}")
            return None


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
    
    lead = await amocrm_client.create_lead(
        name=name,
        custom_fields={
            # Add your custom field IDs here after setting up AmoCRM
            # "123456": serial_number,
            # "123457": str(telegram_user_id),
        }
    )
    
    return lead.get("id") if lead else None
