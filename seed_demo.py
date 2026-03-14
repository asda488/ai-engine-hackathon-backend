import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

def seed_demo_data():
    # Create employer
    employer = supabase.table("employers").insert({
        "user_id": "demo-employer",
        "company_name": "The Fringe Bar"
    }).execute()

    employer_id = employer.data[0]['id']

    # Create document
    document = supabase.table("documents").insert({
        "employer_id": employer_id,
        "filename": "bartender_training.pdf",
        "storage_url": "demo-url",
        "extracted_text": "Sample bartender training content..."
    }).execute()

    document_id = document.data[0]['id']

    # Create training module
    training_module = supabase.table("training_modules").insert({
        "document_id": document_id,
        "role": "Bartender",
        "topics": [
            {
                "id": 1,
                "title": "Customer Service",
                "summary": "Learn how to provide excellent customer service.",
                "key_points": ["Greet customers", "Take orders", "Handle complaints"],
                "category": "knowledge"
            }
        ],
        "slides": [
            {"title": "Customer Service", "content": "Learn how to provide excellent customer service."}
        ]
    }).execute()

    training_module_id = training_module.data[0]['id']

    # Create quiz
    supabase.table("quizzes").insert({
        "training_module_id": training_module_id,
        "questions": [
            {
                "id": 1,
                "question": "How should you greet a customer?",
                "options": ["Ignore them", "Smile and say hello", "Ask for money", "Walk away"],
                "correct_index": 1,
                "explanation": "Greeting customers warmly creates a positive experience.",
                "category": "knowledge"
            }
        ]
    }).execute()

    # Create volunteers
    volunteers = [
        {"user_id": "volunteer-1", "name": "Alex Turner", "email": "alex@example.com"},
        {"user_id": "volunteer-2", "name": "Jamie Chen", "email": "jamie@example.com"},
        {"user_id": "volunteer-3", "name": "Sam Reid", "email": "sam@example.com"}
    ]

    volunteer_ids = []
    for vol in volunteers:
        v = supabase.table("volunteers").insert(vol).execute()
        volunteer_ids.append(v.data[0]['id'])

    # Create quiz attempts and passports
    attempts = [
        {"volunteer_id": volunteer_ids[0], "score": 90, "passed": True, "xp": 190},
        {"volunteer_id": volunteer_ids[1], "score": 74, "passed": True, "xp": 174},
        {"volunteer_id": volunteer_ids[2], "score": 55, "passed": False, "xp": 155}
    ]

    for attempt in attempts:
        supabase.table("passports").insert({
            "volunteer_id": attempt["volunteer_id"],
            "training_module_id": training_module_id,
            "readiness_score": attempt["score"],
            "xp": attempt["xp"],
            "status": "SHIFT READY" if attempt["passed"] else "TRAINING REQUIRED"
        }).execute()

    print("Demo data seeded successfully!")

if __name__ == "__main__":
    seed_demo_data()