import openai
import json
from supabase import create_client
import os
from typing import Dict, Any, List

# Initialize clients only if env vars are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
openai_client = openai.OpenAI(api_key=openai_key) if openai_key else None

def get_relevant_chunks(document_id: str, query: str, top_k: int = 5) -> List[str]:
    # Generate embedding for query
    response = openai_client.embeddings.create(
        input=query,
        model="text-embedding-3-small"
    )
    query_embedding = response.data[0].embedding

    # Search for similar chunks
    result = supabase.rpc('similarity_search', {
        'query_embedding': query_embedding,
        'document_id': document_id,
        'top_k': top_k
    }).execute()

    return [row['chunk_text'] for row in result.data]

def generate_training_module(document_id: str, role: str) -> Dict[str, Any]:
    # Get relevant chunks
    context = " ".join(get_relevant_chunks(document_id, f"training for {role}"))

    prompt = f"""
You are a professional training designer. Based on the following document content, create a structured training module for the role of {role}.

Document content:
{context}

Generate a JSON response with this exact structure:
{{
  "topics": [
    {{
      "id": 1,
      "title": "Topic Title",
      "summary": "2-3 sentence explanation of this topic",
      "key_points": ["point 1", "point 2", "point 3"],
      "category": "knowledge|safety|operations"
    }}
  ],
  "quiz": [
    {{
      "id": 1,
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "explanation": "Why this is correct",
      "category": "knowledge|safety|operations"
    }}
  ]
}}

Generate exactly 4 topics and 10 quiz questions. Make content specific to the role and document.
"""

    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    return json.loads(response.choices[0].message.content)