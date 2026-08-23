# its-mab/mathbuddy-backend/app/main.py
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, questions, sessions, progress, profile

app = FastAPI(title="MathBuddy API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Untuk development lokal
        "https://mathbuddy.vercel.app"  # Ganti dengan URL Vercel-mu
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(sessions.router)
app.include_router(progress.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"message": "MathBuddy API is running!"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)