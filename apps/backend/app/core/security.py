import hmac
import hashlib
import json
import time
from urllib.parse import parse_qsl, unquote
from datetime import datetime, timedelta
from typing import Optional, Any, Union

from jose import jwt
from fastapi import HTTPException

from apps.backend.app.core.config import settings

def validate_telegram_data(init_data: str, bot_token: str) -> bool:
    """
    Validates the initData received from Telegram WebApp.
    Source: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    """
    try:
        # 1. Parse query string
        parsed_data = dict(parse_qsl(init_data))
        
        # 2. Check hash existence
        received_hash = parsed_data.pop('hash', None)
        if not received_hash:
            return False
            
        # 3. Check auth_date (prevent replay attacks)
        auth_date = int(parsed_data.get('auth_date', 0))
        if time.time() - auth_date > 86400: # 24 hours
             return False

        # 4. Sort keys alphabeticaly and create data-check-string
        data_check_string = '\n'.join(
            f"{key}={value}" for key, value in sorted(parsed_data.items())
        )
        
        # 5. Calculate HMAC-SHA256
        secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        return calculated_hash == received_hash
    except Exception as e:
        print(f"Validation Error: {e}")
        return False

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"sub": str(subject), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except jwt.JWTError:
        return None
