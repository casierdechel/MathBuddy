# its-mab/mathbuddy-backend/app/auth.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, LoginResponse
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.nis == request.nis).first()
    if not user:
        raise HTTPException(status_code=401, detail="NIS tidak ditemukan")
    
    # Verifikasi password (hash bcrypt)
    if not pwd_context.verify(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Password salah")
    
    # Generate JWT
    token_data = {"sub": str(user.id), "exp": datetime.utcnow() + timedelta(hours=8)}
    token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return {
        "status": "success",
        "token": token,
        "user": {"id": user.id, "name": user.name, "group_type": user.group_type}
    }