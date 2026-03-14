"""
Document Agent — responsible for ingesting employer documents.
Extracts text, chunks it, generates embeddings, and stores everything in Supabase.
"""
from services.document_processor import extract_text_from_pdf, chunk_text, generate_embeddings, store_document_chunks
from supabase import create_client
import os
import tempfile
from typing import Dict, Any


supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


class DocumentAgent:
    """Processes uploaded documents into searchable, embeddable chunks."""

    def run(self, file_bytes: bytes, filename: str, employer_id: str) -> Dict[str, Any]:
        suffix = os.path.splitext(filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            if filename.endswith('.pdf'):
                text = extract_text_from_pdf(tmp_path)
            else:
                with open(tmp_path, 'r', encoding='utf-8') as f:
                    text = f.read()

            chunks = chunk_text(text)
            embeddings = generate_embeddings(chunks)

            doc_result = supabase.table("documents").insert({
                "employer_id": employer_id,
                "filename": filename,
                "storage_url": f"local://{filename}",
                "extracted_text": text
            }).execute()

            document_id = doc_result.data[0]['id']
            store_document_chunks(document_id, chunks, embeddings)

            return {
                "document_id": document_id,
                "chunk_count": len(chunks),
                "text_length": len(text)
            }
        finally:
            os.unlink(tmp_path)
