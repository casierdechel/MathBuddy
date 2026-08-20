# its-mab/mathbuddy-backend/app/models.py
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nis = Column(String(20), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    name = Column(String(100), nullable=False)
    school = Column(String(100))
    current_session = Column(Integer, default=1)
    group_type = Column(String(20))  # 'experiment' or 'control'
    created_at = Column(TIMESTAMP, server_default=func.now())

class Arm(Base):
    __tablename__ = "arms"
    id = Column(Integer, primary_key=True)
    difficulty = Column(String(10))
    target_misconception = Column(String(20))
    description = Column(String(100))

class UserArmParam(Base):
    __tablename__ = "user_arm_params"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    arm_id = Column(Integer, ForeignKey("arms.id"))
    alpha = Column(Float, default=1.0)
    beta = Column(Float, default=1.0)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    text = Column(Text)
    a = Column(Integer)
    b = Column(Integer)
    c = Column(Integer)
    d = Column(Integer)
    operator = Column(String(1))
    correct_answer = Column(String(50))
    options = Column(Text)  # JSON as string
    difficulty = Column(String(10))
    target_misconception = Column(String(20))
    default_representation = Column(String(20), default="visual")
    created_at = Column(TIMESTAMP, server_default=func.now())

class LearningSession(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_number = Column(Integer)
    pretest_score = Column(Integer, default=0)
    posttest_score = Column(Integer, default=0)
    started_at = Column(TIMESTAMP, server_default=func.now())
    completed_at = Column(TIMESTAMP, nullable=True)
    is_completed = Column(Boolean, default=False)

class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    arm_id = Column(Integer, ForeignKey("arms.id"))
    sequence_number = Column(Integer)
    student_answer = Column(String(50))
    is_correct = Column(Boolean)
    misconception_type = Column(String(20))
    reward = Column(Float)
    representation_used = Column(String(20))
    response_time = Column(Integer, nullable=True) 
    created_at = Column(TIMESTAMP, server_default=func.now())
    # Relationships
    question = relationship("Question")      
    user = relationship("User")                
    session = relationship("LearningSession") 
    arm = relationship("Arm")