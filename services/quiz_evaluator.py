from supabase import create_client
import os
from typing import Dict, Any, List

# Initialize client only if env vars are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

def evaluate_quiz(volunteer_id: str, quiz_id: str, answers: List[Dict]) -> Dict[str, Any]:
    # Get quiz questions
    quiz_result = supabase.table("quizzes").select("questions").eq("id", quiz_id).execute()
    questions = quiz_result.data[0]['questions']

    score = 0
    total_questions = len(questions)
    category_scores = {"knowledge": 0, "safety": 0, "operations": 0}
    category_counts = {"knowledge": 0, "safety": 0, "operations": 0}

    for i, answer in enumerate(answers):
        question = questions[i]
        if answer['selected_option'] == question['correct_index']:
            score += 1
            category_scores[question['category']] += 1
        category_counts[question['category']] += 1

    percentage = (score / total_questions) * 100
    passed = percentage >= 70

    # Calculate readiness score breakdown
    readiness_breakdown = {}
    for category in category_scores:
        if category_counts[category] > 0:
            readiness_breakdown[category] = (category_scores[category] / category_counts[category]) * 100
        else:
            readiness_breakdown[category] = 0

    overall_readiness = sum(readiness_breakdown.values()) / len(readiness_breakdown)

    # Award XP
    xp = 100 + int(percentage)  # Base 100 + bonus for score

    # Create passport
    passport_result = supabase.table("passports").insert({
        "volunteer_id": volunteer_id,
        "training_module_id": supabase.table("quizzes").select("training_module_id").eq("id", quiz_id).execute().data[0]['training_module_id'],
        "readiness_score": int(overall_readiness),
        "xp": xp,
        "status": "SHIFT READY" if passed else "TRAINING REQUIRED"
    }).execute()

    # Record quiz attempt
    supabase.table("quiz_attempts").insert({
        "volunteer_id": volunteer_id,
        "quiz_id": quiz_id,
        "answers": answers,
        "score": int(percentage),
        "passed": passed
    }).execute()

    return {
        "score": int(percentage),
        "passed": passed,
        "readiness_score": int(overall_readiness),
        "breakdown": readiness_breakdown,
        "xp": xp,
        "passport_id": passport_result.data[0]['id']
    }