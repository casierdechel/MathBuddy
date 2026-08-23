# its-mab/mathbuddy-backend/app/routers/questions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Question, Arm, UserArmParam, Interaction, LearningSession
from app.core.mab import select_arm, update_arm_params
from app.core.misconception import detect_misconception
from app.core.representation import determine_next_representation
from app.schemas import NextQuestionRequest, SubmitAnswerRequest
from app.dependencies import get_current_user
import logging
import random
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/questions", tags=["questions"])

@router.post("/next")
def get_next_question(
    req: NextQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Mapping session_number -> target_misconception
    session_target_map = {
        1: 'direct_addition',
        2: 'denominator_error',
        3: 'lcm_error'
    }
    target = session_target_map.get(current_user.current_session, 'direct_addition')

    # Cari atau buat session
    db_session = db.query(LearningSession).filter(
        LearningSession.user_id == current_user.id,
        LearningSession.session_number == current_user.current_session
    ).first()
    
    if db_session:
        session_id = db_session.id
        logger.info(f"User {current_user.id} using existing session {session_id} for session_number {current_user.current_session}")
    else:
        db_session = LearningSession(
            user_id=current_user.id,
            session_number=current_user.current_session,
            is_completed=False
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        session_id = db_session.id
        logger.info(f"User {current_user.id} created new session {session_id} for session_number {current_user.current_session}")

    last_interaction = db.query(Interaction).filter(
            Interaction.user_id == current_user.id,
            Interaction.session_id == session_id
        ).order_by(Interaction.sequence_number.desc()).first()

    if last_interaction:
        next_sequence = last_interaction.sequence_number + 1
    else:
        next_sequence = 1
    
    # Hitung jumlah soal none yang sudah dijawab di sesi ini
    none_count = db.query(Interaction).join(Question).filter(
        Interaction.user_id == current_user.id,
        Interaction.session_id == session_id,
        Question.target_misconception == 'none'
    ).count()
    
    # Tentukan arm yang diizinkan berdasarkan sesi dan kuota none
    allowed_arm_ids = db.query(Arm.id).filter(
        (Arm.target_misconception == target) | 
        (Arm.target_misconception == 'none' and none_count < 5)
    ).all()
    allowed_arm_ids = [a[0] for a in allowed_arm_ids]
    
    if not allowed_arm_ids:
        allowed_arm_ids = db.query(Arm.id).filter(Arm.target_misconception == target).all()
        allowed_arm_ids = [a[0] for a in allowed_arm_ids]
    
    # Ambil parameter MAB untuk arm yang diizinkan
    user_params = db.query(UserArmParam).filter(
        UserArmParam.user_id == current_user.id,
        UserArmParam.arm_id.in_(allowed_arm_ids)
    ).all()
    
    if not user_params:
        raise HTTPException(status_code=404, detail="Tidak ada arm yang tersedia untuk sesi ini")
    
    arms_data = [
        {"arm_id": param.arm_id, "alpha": param.alpha, "beta": param.beta}
        for param in user_params
    ]
    
    selected_arm_id = select_arm(arms_data)
    
    # Ambil soal yang belum dikerjakan di sesi ini
    answered_questions = db.query(Interaction.question_id).filter(
        Interaction.user_id == current_user.id,
        Interaction.session_id == session_id
    ).subquery()
    
    # Dapatkan arm detail untuk filter soal
    selected_arm = db.query(Arm).filter(Arm.id == selected_arm_id).first()
    if not selected_arm:
        raise HTTPException(status_code=404, detail="Arm tidak ditemukan")
    
    # Cari soal sesuai arm yang dipilih
    question = db.query(Question).filter(
        Question.difficulty == selected_arm.difficulty,
        Question.target_misconception == selected_arm.target_misconception,
        Question.id.notin_(answered_questions)
    ).first()
    
    # Fallback
    if not question:
        # Coba ambil dari arm target terlebih dahulu
        target_arm_ids = db.query(Arm.id).filter(Arm.target_misconception == target).all()
        target_arm_ids = [a[0] for a in target_arm_ids]
        for arm_id in target_arm_ids:
            arm = db.query(Arm).filter(Arm.id == arm_id).first()
            q = db.query(Question).filter(
                Question.difficulty == arm.difficulty,
                Question.target_misconception == arm.target_misconception,
                Question.id.notin_(answered_questions)
            ).first()
            if q:
                question = q
                break
        
        # Jika masih tidak ada, coba dari none (jika kuota belum penuh)
        if not question and none_count < 5:
            none_arm_ids = db.query(Arm.id).filter(Arm.target_misconception == 'none').all()
            none_arm_ids = [a[0] for a in none_arm_ids]
            for arm_id in none_arm_ids:
                arm = db.query(Arm).filter(Arm.id == arm_id).first()
                q = db.query(Question).filter(
                    Question.difficulty == arm.difficulty,
                    Question.target_misconception == arm.target_misconception,
                    Question.id.notin_(answered_questions)
                ).first()
                if q:
                    question = q
                    break
        
        # Jika masih tidak ada, ambil soal acak
        if not question:
            question = db.query(Question).filter(
                Question.id.notin_(answered_questions)
            ).first()
            if not question:
                raise HTTPException(status_code=404, detail="Tidak ada soal tersisa di bank soal")
    
    # Randomisasi opsi jawaban
    options_raw = question.options
    if isinstance(options_raw, str):
        options_list = json.loads(options_raw)
    else:
        options_list = options_raw
    
    random.shuffle(options_list)
    if question.correct_answer not in options_list:
        options_list[random.randint(0, 3)] = question.correct_answer
    
    shuffled_options = json.dumps(options_list)
    
    return {
        "status": "success",
        "data": {
            "question_id": question.id,
            "text": question.text,
            "options": shuffled_options,
            "arm_id": selected_arm_id,
            "representation": req.current_representation,
            "session_id": session_id,
            "sequence_number": next_sequence
        }
    }

@router.post("/submit")
def submit_answer(
    req: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == req.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Soal tidak ditemukan")
    
    misconception = detect_misconception(
        question.a, question.b, question.c, question.d, question.operator, req.answer
    )
    
    is_correct = (req.answer == question.correct_answer)
    
    # --- TENTUKAN REWARD ---
    # Cek apakah soal ini pernah dijawab salah sebelumnya di sesi yang sama
    previous_wrong = db.query(Interaction).filter(
        Interaction.user_id == current_user.id,
        Interaction.session_id == req.session_id,
        Interaction.question_id == req.question_id,
        Interaction.is_correct == False
    ).first()
    
    if is_correct and previous_wrong:
        # Perbaikan dari kesalahan sebelumnya -> reward +0.5
        reward = 0.5
    elif is_correct:
        reward = 1.0
    elif misconception != 'unknown':
        reward = -0.5
    else:
        reward = -1.0
    
    # Update parameter MAB
    user_param = db.query(UserArmParam).filter(
        UserArmParam.user_id == current_user.id,
        UserArmParam.arm_id == req.arm_id
    ).first()
    
    if user_param:
        new_alpha, new_beta = update_arm_params(user_param.alpha, user_param.beta, reward)
        user_param.alpha = new_alpha
        user_param.beta = new_beta
        db.commit()
    
    # --- ADAPTIVE REPRESENTATION (dengan Rule 4) ---
    # Ambil riwayat miskonsepsi dari sesi ini (untuk Rule 4)
    all_interactions = db.query(Interaction).filter(
        Interaction.user_id == current_user.id,
        Interaction.session_id == req.session_id
    ).order_by(Interaction.id).all()
    
    misconception_history = [i.misconception_type for i in all_interactions]
    target_misconception = question.target_misconception  # target dari soal saat ini
    
    # Ambil 5 riwayat jawaban terakhir untuk naik/turun
    history_with_current = [i.is_correct for i in all_interactions] + [is_correct]
    recent_history = history_with_current[-5:] if len(history_with_current) >= 5 else history_with_current

    current_rep = req.current_representation

    next_rep = determine_next_representation(
        recent_history,
        current_rep,
        misconception_history=misconception_history,
        target_misconception=target_misconception
    )

    print(f"🔍 DEBUG [user={current_user.id}, session={req.session_id}]:")
    print(f"   recent_history = {recent_history}")
    print(f"   current_rep = {current_rep}")
    print(f"   misconception_history (last 5) = {misconception_history[-5:]}")
    print(f"   target_misconception = {target_misconception}")
    print(f"   next_rep = {next_rep}")
    print("=" * 50)
    
    # Simpan interaksi
    interaction = Interaction(
        user_id=current_user.id,
        session_id=req.session_id,
        question_id=req.question_id,
        arm_id=req.arm_id,
        sequence_number=(len(all_interactions) + 1),
        student_answer=req.answer,
        is_correct=is_correct,
        misconception_type=misconception,
        reward=reward,
        representation_used=req.current_representation,
        response_time=0
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    
    # CEK APAKAH SESI SELESAI
    total_interactions = len(all_interactions) + 1
    logger.info(f"User {current_user.id} session {req.session_id} has {total_interactions} interactions")
    
    if total_interactions >= 20:
        db.query(LearningSession).filter(
            LearningSession.id == req.session_id
        ).update({"is_completed": True})
        
        if current_user.current_session < 3:
            current_user.current_session += 1
            logger.info(f"User {current_user.id} moved to session {current_user.current_session}")
        else:
            logger.info(f"User {current_user.id} already at session 3")
        
        db.commit()
        logger.info(f"Session {req.session_id} completed. New current_session = {current_user.current_session}")
    
    # Feedback
    feedback_text = ""
    if is_correct and previous_wrong:
        feedback_text = "Bagus! Kamu berhasil memperbaiki kesalahan sebelumnya!"
    elif is_correct:
        feedback_text = "Jawaban benar!"
    elif misconception == 'direct_addition':
        feedback_text = f"Kamu menjumlahkan pembilang dan penyebut secara langsung ({question.a+question.c}/{question.b+question.d}). Ingat, penyebut harus disamakan dulu!"
    elif misconception == 'denominator_error':
        feedback_text = f"Kamu belum menyamakan penyebut sebelum menjumlahkan. Coba cari KPK dari {question.b} dan {question.d}!"
    elif misconception == 'lcm_error':
        feedback_text = f"Kamu salah menentukan KPK. Coba cari kelipatan persekutuan terkecil dari {question.b} dan {question.d}!"
    else:
        feedback_text = "Jawaban salah. Coba periksa kembali langkah-langkahmu!"
    
    return {
        "status": "success",
        "data": {
            "is_correct": is_correct,
            "misconception": misconception,
            "feedback": feedback_text,
            "next_representation": next_rep,
            "reward": reward,
            "current_session": current_user.current_session
        }
    }