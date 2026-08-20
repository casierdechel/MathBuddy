# its-mab/mathbuddy-backend/app/routers/profile.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    name: str
    school: str

@router.get("/{user_id}")
def get_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Pastikan user hanya bisa melihat profil sendiri
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Tidak bisa melihat profil user lain")
    
    return {
        "status": "success",
        "data": {
            "id": current_user.id,
            "name": current_user.name,
            "school": current_user.school,
            "nis": current_user.nis,
            "group_type": current_user.group_type
        }
    }

@router.put("/{user_id}")
def update_profile(
    user_id: int,
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Tidak bisa mengubah profil user lain")
    
    current_user.name = profile_data.name
    current_user.school = profile_data.school
    db.commit()
    db.refresh(current_user)
    
    return {
        "status": "success",
        "message": "Profil berhasil diupdate",
        "data": {
            "id": current_user.id,
            "name": current_user.name,
            "school": current_user.school
        }
    }