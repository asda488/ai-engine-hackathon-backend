from supabase import create_client
import os
from typing import Dict, Any, List

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


def evaluate_quiz(volunteer_id: str, quiz_id: str, answers: List[Dict]) -> Dict[str, Any]:
    quiz_result = supabase.table("quizzes").select("questions, training_module_id").eq("id", quiz_id).execute()
    if not quiz_result.data:
        raise ValueError(f"Quiz {quiz_id} not found")

    questions = quiz_result.data[0]['questions']
    training_module_id = quiz_result.data[0]['training_module_id']
    total_questions = len(questions)

    score = 0
    category_scores = {"knowledge": 0, "safety": 0, "operations": 0}
    category_counts = {"knowledge": 0, "safety": 0, "operations": 0}

    for i, answer in enumerate(answers):
        if i >= total_questions:
            break
        question = questions[i]
        category = question.get('category', 'knowledge')
        category_counts[category] = category_counts.get(category, 0) + 1
        if answer['selected_option'] == question['correct_index']:
            score += 1
            category_scores[category] = category_scores.get(category, 0) + 1

    percentage = round((score / total_questions) * 100) if total_questions > 0 else 0
    passed = percentage >= 70

    readiness_breakdown = {}
    for category in ["knowledge", "safety", "operations"]:
        if category_counts[category] > 0:
            readiness_breakdown[category] = round((category_scores[category] / category_counts[category]) * 100)
        else:
            readiness_breakdown[category] = 0

    overall_readiness = round(sum(readiness_breakdown.values()) / len(readiness_breakdown))
    xp = 100 + percentage  # base 100 + bonus

    passport_result = supabase.table("passports").insert({
        "volunteer_id": volunteer_id,
        "training_module_id": training_module_id,
        "readiness_score": overall_readiness,
        "xp": xp,
        "score": percentage,
        "breakdown": readiness_breakdown,
        "status": "SHIFT READY" if passed else "TRAINING REQUIRED"
    }).execute()

    supabase.table("quiz_attempts").insert({
        "volunteer_id": volunteer_id,
        "quiz_id": quiz_id,
        "answers": answers,
        "score": percentage,
        "passed": passed
    }).execute()

    passport_id = passport_result.data[0]['id']

    return {
        "score": percentage,
        "passed": passed,
        "readiness_score": overall_readiness,
        "breakdown": readiness_breakdown,
        "xp": xp,
        "passport_id": passport_id
    }
