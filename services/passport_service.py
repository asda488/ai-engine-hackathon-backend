from supabase import create_client
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()


supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


def _format_passport(passport: Dict) -> Dict[str, Any]:
    return {
        "id": passport['id'],
        "volunteer_name": passport['volunteers']['name'],
        "volunteer_email": passport['volunteers']['email'],
        "role": passport['training_modules']['role'],
        "skills": [topic['title'] for topic in passport['training_modules']['topics']],
        "readiness_score": passport['readiness_score'],
        "score": passport.get('score', 0),
        "breakdown": passport.get('breakdown', {}),
        "xp": passport['xp'],
        "status": passport['status'],
        "issued_at": passport['issued_at']
    }


def get_passport(volunteer_id: str) -> Optional[Dict[str, Any]]:
    result = supabase.table("passports").select("""
        *,
        volunteers(name, email),
        training_modules(role, topics)
    """).eq("volunteer_id", volunteer_id).order("issued_at", desc=True).limit(1).execute()

    if not result.data:
        return None

    return _format_passport(result.data[0])


def get_passport_by_id(passport_id: str) -> Optional[Dict[str, Any]]:
    result = supabase.table("passports").select("""
        *,
        volunteers(name, email),
        training_modules(role, topics)
    """).eq("id", passport_id).execute()

    if not result.data:
        return None

    return _format_passport(result.data[0])
