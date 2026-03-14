from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import documents, training, quiz, passport
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ShiftPass API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api")
app.include_router(training.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(passport.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "ShiftPass API"}