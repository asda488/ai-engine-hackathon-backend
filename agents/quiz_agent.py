"""
Quiz Agent — retrieves quiz questions for a training module, sanitized for volunteer view.
"""
from supabase import create_client
import os
from typing import Dict, Any, List


supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


class QuizAgent:
    """Fetches and sanitizes quiz questions for a given training module."""

    def get_for_volunteer(self, training_module_id: str) -> Dict[str, Any]:
        result = supabase.table("quizzes").select("id, questions").eq("training_module_id", training_module_id).execute()
        if not result.data:
            raise ValueError(f"No quiz found for training module {training_module_id}")

        quiz_id = result.data[0]['id']
        questions = result.data[0]['questions']

        sanitized: List[Dict] = []
        for q in questions:
            sanitized.append({
                "id": q['id'],
                "question": q['question'],
                "options": q['options'],
                "category": q['category']
            })

        return {"quiz_id": quiz_id, "questions": sanitized}

    def get_with_answers(self, training_module_id: str) -> Dict[str, Any]:
        """Returns full questions including correct answers — for employer preview only."""
        result = supabase.table("quizzes").select("id, questions").eq("training_module_id", training_module_id).execute()
        if not result.data:
            raise ValueError(f"No quiz found for training module {training_module_id}")

        return {
            "quiz_id": result.data[0]['id'],
            "questions": result.data[0]['questions']
        }
