# its-mab/mathbuddy-backend/app/routers/sessions.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, LearningSession, Interaction
from app.dependencies import get_current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.get("/status")
def get_session_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fungsi untuk menghitung interaksi berdasarkan session_number
    def count_interactions(session_num: int) -> int:
        session = db.query(LearningSession).filter(
            LearningSession.user_id == current_user.id,
            LearningSession.session_number == session_num
        ).first()
        if not session:
            return 0
        return db.query(Interaction).filter(
            Interaction.user_id == current_user.id,
            Interaction.session_id == session.id
        ).count()
    
    # Hitung interaksi untuk semua sesi sekaligus
    cnt1 = count_interactions(1)
    cnt2 = count_interactions(2)
    cnt3 = count_interactions(3)
    
    # Tentukan status setiap sesi
    session_1_status = 'completed' if cnt1 >= 20 else 'unlocked'
    
    if cnt1 >= 20:
        session_2_status = 'completed' if cnt2 >= 20 else 'unlocked'
    else:
        session_2_status = 'locked'
    
    if cnt2 >= 20:
        session_3_status = 'completed' if cnt3 >= 20 else 'unlocked'
    else:
        session_3_status = 'locked'
    
    return {
        "status": "success",
        "data": {
            "session_1": session_1_status,
            "session_2": session_2_status,
            "session_3": session_3_status
        }
    }