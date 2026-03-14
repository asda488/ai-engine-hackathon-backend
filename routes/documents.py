from fastapi import APIRouter, UploadFile, File, HTTPException
from services.document_processor import extract_text_from_pdf, chunk_text, generate_embeddings, store_document_chunks
from supabase import create_client
import os
import tempfile

router = APIRouter()

# Initialize client only if env vars are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...), employer_id: str = None):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        # Extract text
        if file.filename.endswith('.pdf'):
            extracted_text = extract_text_from_pdf(temp_path)
        else:
            with open(temp_path, 'r') as f:
                extracted_text = f.read()

        # Chunk text
        chunks = chunk_text(extracted_text)

        # Generate embeddings
        embeddings = generate_embeddings(chunks)

        # Store document
        doc_result = supabase.table("documents").insert({
            "employer_id": employer_id,
            "filename": file.filename,
            "storage_url": f"supabase://storage/{file.filename}",  # Placeholder
            "extracted_text": extracted_text
        }).execute()

        document_id = doc_result.data[0]['id']

        # Store chunks
        store_document_chunks(document_id, chunks, embeddings)

        return {"document_id": document_id, "chunk_count": len(chunks)}

    finally:
        os.unlink(temp_path)