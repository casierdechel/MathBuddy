# its-mab/mathbuddy-backend/app/schemas.py
from pydantic import BaseModel
from typing import List, Optional

# --- Request/Response untuk Questions ---
class NextQuestionRequest(BaseModel):
    current_representation: str = "visual"

class NextQuestionResponse(BaseModel):
    status: str
    data: dict  # kita return fleksibel dulu

class SubmitAnswerRequest(BaseModel):
    user_id: int
    question_id: int
    arm_id: int
    session_id: int
    answer: str
    current_representation: str = "visual"

class SubmitAnswerResponse(BaseModel):
    status: str
    data: dict

class LoginRequest(BaseModel):
    nis: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    group_type: str

class LoginResponse(BaseModel):
    status: str
    token: str
    user: UserResponse