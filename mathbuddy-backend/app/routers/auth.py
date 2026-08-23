# its-mab/mathbuddy-backend/app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, LoginResponse
from jose import jwt
from datetime import datetime, timedelta
from app.config import settings
import bcrypt

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.nis == request.nis).first()
    if not user:
        raise HTTPException(status_code=401, detail="NIS tidak ditemukan")

    # Pastikan password_hash tidak None
    if not user.password_hash:
        raise HTTPException(status_code=401, detail="Password hash tidak valid")

    # Verifikasi password dengan bcrypt langsung
    try:
        if not bcrypt.checkpw(
            request.password.encode('utf-8'),
            user.password_hash.encode('utf-8')
        ):
            raise HTTPException(status_code=401, detail="Password salah")
    except ValueError as e:
        # Jika hash tidak valid (misal format salah)
        raise HTTPException(status_code=401, detail="Format password hash tidak valid")

    token_data = {
        "sub": str(user.id),
        "exp": datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    }
    token = jwt.encode(token_data, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "group_type": user.group_type,
            "current_session": user.current_session or 1
        }
    }