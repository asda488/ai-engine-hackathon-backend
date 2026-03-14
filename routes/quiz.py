from fastapi import APIRouter, HTTPException
from services.quiz_evaluator import evaluate_quiz
from supabase import create_client
import os

router = APIRouter()

# Initialize client only if env vars are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

@router.get("/quiz/{training_module_id}")
async def get_quiz(training_module_id: str):
    # Get quiz for training module
    result = supabase.table("quizzes").select("questions").eq("training_module_id", training_module_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = result.data[0]['questions']
    # Remove correct answers and explanations for volunteer view
    for q in questions:
        del q['correct_index']
        del q['explanation']

    return {"questions": questions}

@router.post("/submit-quiz")
async def submit_quiz(volunteer_id: str, quiz_id: str, answers: list):
    try:
        result = evaluate_quiz(volunteer_id, quiz_id, answers)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))