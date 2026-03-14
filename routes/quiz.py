import logging
import os
import uuid
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, field_validator
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.quiz_evaluator import evaluate_quiz
from supabase import create_client

logger = logging.getLogger("shiftpass.quiz")
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

NAMESPACE = uuid.UUID("12345678-1234-5678-1234-567812345678")


def upsert_volunteer(volunteer_uuid: str, name: str, email: str) -> str:
    """Find or create volunteer by UUID. Returns confirmed UUID."""
    existing = supabase.table("volunteers").select("id").eq("id", volunteer_uuid).execute()
    if existing.data:
        return existing.data[0]["id"]

    # Try by email (same person, different device)
    by_email = supabase.table("volunteers").select("id").eq("email", email.lower()).execute()
    if by_email.data:
        return by_email.data[0]["id"]

    result = supabase.table("volunteers").insert({
        "id": volunteer_uuid,
        "user_id": str(uuid.uuid5(NAMESPACE, email.lower())),
        "name": name.strip(),
        "email": email.strip().lower(),
    }).execute()
    logger.info("Created volunteer %s (%s)", volunteer_uuid, email)
    return result.data[0]["id"]


class Answer(BaseModel):
    question_id: int
    selected_option: int

    @field_validator("selected_option")
    @classmethod
    def validate_option(cls, v: int) -> int:
        if not (0 <= v <= 3):
            raise ValueError("selected_option must be 0-3")
        return v


class SubmitQuizRequest(BaseModel):
    volunteer_id: str
    volunteer_name: str
    volunteer_email: str
    quiz_id: str
    answers: List[Answer]

    @field_validator("volunteer_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name is required")
        return v.strip()

    @field_validator("volunteer_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v or "." not in v:
            raise ValueError("Valid email is required")
        return v.strip().lower()

    @field_validator("answers")
    @classmethod
    def validate_answers(cls, v: List[Answer]) -> List[Answer]:
        if not v:
            raise ValueError("Answers cannot be empty")
        return v


@router.get("/quiz/{training_module_id}")
async def get_quiz(training_module_id: str):
    try:
        result = supabase.table("quizzes").select("id, questions").eq("training_module_id", training_module_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Quiz not found.")

        questions = result.data[0]["questions"]
        sanitized = [
            {"id": q["id"], "question": q["question"], "options": q["options"], "category": q["category"]}
            for q in questions
        ]
        return {"quiz_id": result.data[0]["id"], "questions": sanitized}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Get quiz failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load quiz.")


@router.get("/quiz/{training_module_id}/full")
async def get_quiz_with_answers(training_module_id: str):
    try:
        result = supabase.table("quizzes").select("id, questions").eq("training_module_id", training_module_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Quiz not found.")
        return {"quiz_id": result.data[0]["id"], "questions": result.data[0]["questions"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Get full quiz failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load quiz.")


@router.post("/submit-quiz")
@limiter.limit("30/minute")
async def submit_quiz(request: Request, body: SubmitQuizRequest):
    try:
        resolved_id = upsert_volunteer(body.volunteer_id, body.volunteer_name, body.volunteer_email)
        answers_list = [{"question_id": a.question_id, "selected_option": a.selected_option} for a in body.answers]
        result = evaluate_quiz(resolved_id, body.quiz_id, answers_list)
        logger.info("Quiz submitted by volunteer %s: score=%d passed=%s", resolved_id, result["score"], result["passed"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Quiz submission failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")
