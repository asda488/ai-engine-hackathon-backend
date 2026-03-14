from fastapi import APIRouter, HTTPException
from services.training_generator import generate_training_module
from supabase import create_client
import os

router = APIRouter()

# Initialize client only if env vars are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

@router.post("/generate-training")
async def generate_training(document_id: str, role: str):
    try:
        training_data = generate_training_module(document_id, role)

        # Store training module
        module_result = supabase.table("training_modules").insert({
            "document_id": document_id,
            "role": role,
            "topics": training_data['topics'],
            "slides": [{"title": topic['title'], "content": topic['summary']} for topic in training_data['topics']]
        }).execute()

        training_module_id = module_result.data[0]['id']

        # Store quiz
        quiz_result = supabase.table("quizzes").insert({
            "training_module_id": training_module_id,
            "questions": training_data['quiz']
        }).execute()

        quiz_id = quiz_result.data[0]['id']

        return {
            "training_module_id": training_module_id,
            "topics": training_data['topics'],
            "slides": module_result.data[0]['slides'],
            "quiz_id": quiz_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/training/{training_module_id}")
async def get_training(training_module_id: str):
    result = supabase.table("training_modules").select("*").eq("id", training_module_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Training module not found")
    return result.data[0]