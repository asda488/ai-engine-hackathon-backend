from fastapi import APIRouter, HTTPException
from services.passport_service import get_passport, get_passport_by_id
from supabase import create_client
import os

router = APIRouter()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


@router.get("/passport/{volunteer_id}")
async def get_passport_endpoint(volunteer_id: str):
    try:
        passport = get_passport(volunteer_id)
        if not passport:
            raise HTTPException(status_code=404, detail="Passport not found")
        return passport
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/result/{passport_id}")
async def get_result(passport_id: str):
    """Get full result data by passport ID — used on the result page after quiz submission."""
    try:
        passport = get_passport_by_id(passport_id)
        if not passport:
            raise HTTPException(status_code=404, detail="Result not found")
        return passport
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/employer/volunteers/{employer_id}")
async def get_employer_volunteers(employer_id: str):
    try:
        result = supabase.table("passports").select("""
            readiness_score, status, xp,
            volunteers(name, email),
            training_modules(role, document_id,
                documents(employer_id))
        """).execute()

        volunteers = []
        for passport in result.data:
            tm = passport.get('training_modules')
            if not tm:
                continue
            doc = tm.get('documents')
            if not doc or doc.get('employer_id') != employer_id:
                continue
            v = passport.get('volunteers')
            volunteers.append({
                "name": v['name'] if v else "Unknown",
                "email": v['email'] if v else "",
                "role": tm['role'],
                "score": passport['readiness_score'],
                "xp": passport['xp'],
                "status": passport['status']
            })

        return volunteers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
