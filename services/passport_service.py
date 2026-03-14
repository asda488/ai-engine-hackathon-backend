from supabase import create_client
import os
from typing import Dict, Any

# Initialize client only if env vars are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

def get_passport(volunteer_id: str) -> Dict[str, Any]:
    result = supabase.table("passports").select("""
        *,
        volunteers(name, email),
        training_modules(role, topics)
    """).eq("volunteer_id", volunteer_id).execute()

    if not result.data:
        return None

    passport = result.data[0]
    return {
        "id": passport['id'],
        "volunteer_name": passport['volunteers']['name'],
        "role": passport['training_modules']['role'],
        "skills": [topic['title'] for topic in passport['training_modules']['topics']],
        "readiness_score": passport['readiness_score'],
        "xp": passport['xp'],
        "status": passport['status'],
        "issued_at": passport['issued_at']
    }