# its-mab/mathbuddy-backend/app/routers/auth.py
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from app.config import settings

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.nis == request.nis).first()
    if not user:
        raise HTTPException(status_code=401, detail="NIS tidak ditemukan")
    
    # Verifikasi dengan bcrypt langsung
    if not bcrypt.checkpw(
        request.password.encode('utf-8'),
        user.password_hash.encode('utf-8')
    ):
        raise HTTPException(status_code=401, detail="Password salah")

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