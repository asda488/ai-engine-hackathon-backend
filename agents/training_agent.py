"""
Training Agent — generates structured training modules from document content.
Uses RAG (semantic search over document chunks) + GPT-4o to produce topics and quiz questions.
"""
from services.training_generator import generate_training_module
from supabase import create_client
import os
from typing import Dict, Any


supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


class TrainingAgent:
    """Generates and stores training modules + quizzes for a given document and role."""

    def run(self, document_id: str, role: str) -> Dict[str, Any]:
        training_data = generate_training_module(document_id, role)

        slides = [
            {
                "title": t['title'],
                "content": t['summary'],
                "key_points": t.get('key_points', [])
            }
            for t in training_data['topics']
        ]

        module_result = supabase.table("training_modules").insert({
            "document_id": document_id,
            "role": role,
            "topics": training_data['topics'],
            "slides": slides
        }).execute()

        training_module_id = module_result.data[0]['id']

        quiz_result = supabase.table("quizzes").insert({
            "training_module_id": training_module_id,
            "questions": training_data['quiz']
        }).execute()

        quiz_id = quiz_result.data[0]['id']

        return {
            "training_module_id": training_module_id,
            "quiz_id": quiz_id,
            "topics": training_data['topics'],
            "slides": slides,
            "question_count": len(training_data['quiz'])
        }
