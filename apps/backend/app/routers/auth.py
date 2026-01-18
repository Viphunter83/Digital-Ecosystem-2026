from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel
import json
from urllib.parse import parse_qsl

from apps.backend.app.core.database import get_db
from apps.backend.app.core.config import settings
from apps.backend.app.core.security import validate_telegram_data, create_access_token, verify_token
from packages.database.models import TelegramUser, UserRole

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    initData: str

@router.post("/login", response_model=Token)
def login_access_token(
    login_data: LoginRequest, 
    db: Session = Depends(get_db)
):
    """
    Validate Telegram initData and return JWT Token.
    Upserts user if not exists.
    """
    if not settings.TELEGRAM_BOT_TOKEN:
         raise HTTPException(status_code=500, detail="Bot token not configured")

    # 1. Validate
    is_valid = validate_telegram_data(login_data.initData, settings.TELEGRAM_BOT_TOKEN)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram data",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Extract User Info
    try:
        parsed_data = dict(parse_qsl(login_data.initData))
        user_json = parsed_data.get('user')
        if not user_json:
             raise HTTPException(status_code=400, detail="No user data in initData")
        
        tg_user_data = json.loads(user_json)
        tg_id = tg_user_data.get('id')
    except Exception:
         raise HTTPException(status_code=400, detail="Malformed initData")

    # 3. Upsert User in DB
    user = db.execute(select(TelegramUser).where(TelegramUser.tg_id == tg_id)).scalar_one_or_none()
    
    if not user:
        # Create new guest
        user = TelegramUser(
            tg_id=tg_id,
            role=None, # Guest
            is_verified=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # 4. Generate Token
    access_token = create_access_token(subject=user.id)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> TelegramUser:
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(TelegramUser).filter(TelegramUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

async def get_current_active_user(
    current_user: TelegramUser = Depends(get_current_user),
) -> TelegramUser:
    # Here we could check if user is verified
    return current_user
