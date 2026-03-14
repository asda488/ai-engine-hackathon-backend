from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from services.document_processor import extract_text_from_pdf, chunk_text, generate_embeddings, store_document_chunks
from supabase import create_client
import os
import tempfile

router = APIRouter()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    employer_id: str = Form(None)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        if file.filename.endswith('.pdf'):
            extracted_text = extract_text_from_pdf(temp_path)
        else:
            with open(temp_path, 'r', encoding='utf-8') as f:
                extracted_text = f.read()

        chunks = chunk_text(extracted_text)
        embeddings = generate_embeddings(chunks)

        doc_result = supabase.table("documents").insert({
            "employer_id": employer_id,
            "filename": file.filename,
            "storage_url": f"local://{file.filename}",
            "extracted_text": extracted_text
        }).execute()

        document_id = doc_result.data[0]['id']
        store_document_chunks(document_id, chunks, embeddings)

        return {"document_id": document_id, "chunk_count": len(chunks)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(temp_path)
