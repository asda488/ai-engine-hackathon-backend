import logging
import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.training_generator import generate_training_module
from supabase import create_client

logger = logging.getLogger("shiftpass.training")
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

ALLOWED_ROLES = {"Bartender", "Server", "Security", "Steward", "Cashier", "Supervisor"}


class GenerateTrainingRequest(BaseModel):
    document_id: str
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ALLOWED_ROLES:
            raise ValueError(f"Role must be one of: {', '.join(sorted(ALLOWED_ROLES))}")
        return v

    @field_validator("document_id")
    @classmethod
    def validate_document_id(cls, v: str) -> str:
        import uuid
        try:
            uuid.UUID(v)
        except ValueError:
            raise ValueError("document_id must be a valid UUID")
        return v


@router.post("/generate-training")
@limiter.limit("10/minute")
async def generate_training(request: Request, body: GenerateTrainingRequest):
    # Confirm document exists
    doc_check = supabase.table("documents").select("id").eq("id", body.document_id).execute()
    if not doc_check.data:
        raise HTTPException(status_code=404, detail="Document not found.")

    try:
        logger.info("Generating training for document %s, role %s", body.document_id, body.role)
        training_data = generate_training_module(body.document_id, body.role)

        module_result = supabase.table("training_modules").insert({
            "document_id": body.document_id,
            "role": body.role,
            "topics": training_data["topics"],
            "slides": [
                {"title": t["title"], "content": t["summary"], "key_points": t.get("key_points", [])}
                for t in training_data["topics"]
            ],
        }).execute()

        training_module_id = module_result.data[0]["id"]

        quiz_result = supabase.table("quizzes").insert({
            "training_module_id": training_module_id,
            "questions": training_data["quiz"],
        }).execute()

        quiz_id = quiz_result.data[0]["id"]
        logger.info("Created training module %s with quiz %s", training_module_id, quiz_id)

        return {
            "training_module_id": training_module_id,
            "topics": training_data["topics"],
            "slides": module_result.data[0]["slides"],
            "quiz_id": quiz_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Training generation failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Training generation failed: {str(e)}")


@router.get("/training/{training_module_id}")
async def get_training(training_module_id: str):
    try:
        result = supabase.table("training_modules").select("*").eq("id", training_module_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Training module not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Get training failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve training module.")
