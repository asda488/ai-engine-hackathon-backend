from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.quiz_evaluator import evaluate_quiz
from supabase import create_client
import os

router = APIRouter()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


class Answer(BaseModel):
    question_id: int
    selected_option: int


class SubmitQuizRequest(BaseModel):
    volunteer_id: str
    quiz_id: str
    answers: List[Answer]


@router.get("/quiz/{training_module_id}")
async def get_quiz(training_module_id: str):
    try:
        result = supabase.table("quizzes").select("id, questions").eq("training_module_id", training_module_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Quiz not found")

        quiz_id = result.data[0]['id']
        questions = result.data[0]['questions']

        # Strip correct answers for volunteer view
        sanitized = []
        for q in questions:
            sanitized.append({
                "id": q['id'],
                "question": q['question'],
                "options": q['options'],
                "category": q['category']
            })

        return {"quiz_id": quiz_id, "questions": sanitized}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quiz/{training_module_id}/full")
async def get_quiz_with_answers(training_module_id: str):
    """Employer-only: returns full quiz including correct answers and explanations."""
    try:
        result = supabase.table("quizzes").select("id, questions").eq("training_module_id", training_module_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Quiz not found")
        return {"quiz_id": result.data[0]['id'], "questions": result.data[0]['questions']}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit-quiz")
async def submit_quiz(request: SubmitQuizRequest):
    try:
        answers_list = [{"question_id": a.question_id, "selected_option": a.selected_option} for a in request.answers]
        result = evaluate_quiz(request.volunteer_id, request.quiz_id, answers_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
