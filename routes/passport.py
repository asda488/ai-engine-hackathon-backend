from fastapi import APIRouter, HTTPException
from services.passport_service import get_passport
from supabase import create_client
import os

router = APIRouter()

# Initialize client only if env vars are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

@router.get("/passport/{volunteer_id}")
async def get_passport_endpoint(volunteer_id: str):
    passport = get_passport(volunteer_id)
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    return passport

@router.get("/employer/volunteers/{employer_id}")
async def get_employer_volunteers(employer_id: str):
    # Get all passports for volunteers who completed training for this employer's modules
    result = supabase.table("passports").select("""
        *,
        volunteers(name, email),
        training_modules(role)
    """).eq("training_modules.document_id.employer_id", employer_id).execute()

    volunteers = []
    for passport in result.data:
        volunteers.append({
            "name": passport['volunteers']['name'],
            "role": passport['training_modules']['role'],
            "score": passport['readiness_score'],
            "status": passport['status']
        })

    return volunteers