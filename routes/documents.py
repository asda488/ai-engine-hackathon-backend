import os
import uuid
import logging
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.document_processor import extract_text_from_pdf, chunk_text, store_document_chunks
from supabase import create_client

logger = logging.getLogger("shiftpass.documents")
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

NAMESPACE = uuid.UUID("12345678-1234-5678-1234-567812345678")
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".pdf", ".txt"}
ALLOWED_ROLES = {"Bartender", "Server", "Security", "Steward", "Cashier", "Supervisor"}


def resolve_employer_id(raw_id: str) -> str:
    """Convert any string to a deterministic UUID and ensure employer exists in DB."""
    try:
        return str(uuid.UUID(raw_id))
    except (ValueError, AttributeError):
        pass

    employer_uuid = str(uuid.uuid5(NAMESPACE, raw_id))
    existing = supabase.table("employers").select("id").eq("id", employer_uuid).execute()
    if not existing.data:
        supabase.table("employers").insert({
            "id": employer_uuid,
            "user_id": str(uuid.uuid5(NAMESPACE, f"user-{raw_id}")),
            "company_name": raw_id,
        }).execute()
        logger.info("Auto-created employer %s for key '%s'", employer_uuid, raw_id)
    return employer_uuid


@router.post("/upload-document")
@limiter.limit("20/minute")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    employer_id: str = Form(None),
):
    # File extension check
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Only PDF and TXT files are supported.")

    # Read and check file size
    content = await file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(content)
        temp_path = tmp.name

    try:
        if ext == ".pdf":
            extracted_text = extract_text_from_pdf(temp_path)
        else:
            extracted_text = content.decode("utf-8", errors="replace")

        if not extracted_text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from file.")

        chunks = chunk_text(extracted_text)
        resolved_id = resolve_employer_id(employer_id) if employer_id else None

        doc_result = supabase.table("documents").insert({
            "employer_id": resolved_id,
            "filename": file.filename,
            "storage_url": f"local://{file.filename}",
            "extracted_text": extracted_text,
        }).execute()

        document_id = doc_result.data[0]["id"]
        store_document_chunks(document_id, chunks)

        logger.info("Uploaded document %s (%d chunks) for employer %s", document_id, len(chunks), resolved_id)
        return {"document_id": document_id, "chunk_count": len(chunks)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Upload failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Document processing failed. Please try again.")
    finally:
        os.unlink(temp_path)
