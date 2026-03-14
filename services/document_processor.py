import openai
import PyPDF2
from supabase import create_client
import os
from typing import List

# Initialize clients only if env vars are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
openai_client = openai.OpenAI(api_key=openai_key) if openai_key else None

def extract_text_from_pdf(file_path: str) -> str:
    with open(file_path, "rb") as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0

    for word in words:
        if current_length + len(word) > chunk_size:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_length = len(word)
        else:
            current_chunk.append(word)
            current_length += len(word) + 1

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def generate_embeddings(chunks: List[str]) -> List[List[float]]:
    embeddings = []
    for chunk in chunks:
        response = openai_client.embeddings.create(
            input=chunk,
            model="text-embedding-3-small"
        )
        embeddings.append(response.data[0].embedding)
    return embeddings

def store_document_chunks(document_id: str, chunks: List[str], embeddings: List[List[float]]):
    for chunk, embedding in zip(chunks, embeddings):
        supabase.table("document_chunks").insert({
            "document_id": document_id,
            "chunk_text": chunk,
            "embedding": embedding
        }).execute()