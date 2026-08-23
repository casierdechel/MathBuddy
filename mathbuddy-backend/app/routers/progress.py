# its-mab/mathbuddy-backend/app/routers/progress.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Interaction
from app.dependencies import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])

@router.get("/{user_id}")
def get_progress(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Tidak bisa melihat progress user lain")
    
    interactions = db.query(Interaction).filter(
        Interaction.user_id == user_id
    ).all()
    
    total_questions = len(interactions)
    if total_questions == 0:
        return {
            "status": "success",
            "data": {
                "total_questions": 0,
                "correct": 0,
                "misconception_wrong": 0,
                "misconceptions": {},
                "misconception_details": []
            }
        }
    
    correct = sum(1 for i in interactions if i.is_correct)
    
    # Hitung miskonsepsi yang jawabannya salah
    misconception_wrong = sum(
        1 for i in interactions
        if i.misconception_type not in ('none', 'unknown') and not i.is_correct
    )
    
    # Hitung per jenis miskonsepsi yang salah
    misconception_counts = {}
    for i in interactions:
        if i.misconception_type not in ('none', 'unknown') and not i.is_correct:
            if i.misconception_type not in misconception_counts:
                misconception_counts[i.misconception_type] = 0
            misconception_counts[i.misconception_type] += 1
    
    # Ambil contoh per jenis miskonsepsi yang salah
    misconception_details = []
    for mis_type, count in misconception_counts.items():
        example = db.query(Interaction).filter(
            Interaction.user_id == user_id,
            Interaction.misconception_type == mis_type,
            Interaction.is_correct == False
        ).first()
        
        if example:
            question = example.question
            misconception_details.append({
                "type": mis_type,
                "count": count,
                "your_answer": example.student_answer,
                "correct_answer": question.correct_answer if question else "?",
                "question_text": question.text if question else "Soal tidak ditemukan",
                "explanation": get_explanation_for_misconception(mis_type)
            })
    
    return {
        "status": "success",
        "data": {
            "total_questions": total_questions,
            "correct": correct,
            "misconception_wrong": misconception_wrong,
            "misconceptions": misconception_counts,
            "misconception_details": misconception_details
        }
    }

def get_explanation_for_misconception(mis_type: str) -> str:
    explanations = {
        "direct_addition": "Kamu menjumlahkan pembilang dan penyebut secara langsung. Ingat, penyebut harus disamakan dulu sebelum dijumlahkan!",
        "denominator_error": "Kamu belum menyamakan penyebut sebelum menjumlahkan. Coba cari KPK dari kedua penyebut!",
        "lcm_error": "Kamu salah menentukan KPK. Coba cari kelipatan persekutuan terkecil dari kedua penyebut dengan benar!"
    }
    return explanations.get(mis_type, "Periksa kembali langkah-langkahmu!")