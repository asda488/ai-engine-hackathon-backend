import anthropic
import json
import logging
import time
from supabase import create_client
import os
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("shiftpass.training_generator")

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
anthropic_key = os.getenv("ANTHROPIC_API_KEY")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
claude = anthropic.Anthropic(api_key=anthropic_key) if anthropic_key else None


def get_relevant_chunks(document_id: str, top_k: int = 10) -> List[str]:
    result = (
        supabase.table("document_chunks")
        .select("chunk_text")
        .eq("document_id", document_id)
        .limit(top_k)
        .execute()
    )
    return [row["chunk_text"] for row in result.data]


def _call_claude(prompt: str, retries: int = 3) -> str:
    """Call Claude with exponential backoff retry."""
    for attempt in range(retries):
        try:
            message = claude.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
            )
            return message.content[0].text.strip()
        except anthropic.RateLimitError:
            if attempt < retries - 1:
                wait = 2 ** attempt
                logger.warning("Claude rate limited, retrying in %ds (attempt %d/%d)", wait, attempt + 1, retries)
                time.sleep(wait)
            else:
                raise
        except anthropic.APIError as e:
            logger.error("Claude API error: %s", e)
            raise


def _parse_json(text: str) -> Dict:
    """Strip markdown fences and parse JSON."""
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            stripped = part.strip()
            if stripped.startswith("json"):
                stripped = stripped[4:].strip()
            try:
                return json.loads(stripped)
            except json.JSONDecodeError:
                continue
    return json.loads(text)


def generate_training_module(document_id: str, role: str) -> Dict[str, Any]:
    chunks = get_relevant_chunks(document_id)
    if not chunks:
        raise ValueError("No document content found. Please re-upload the document.")

    context = " ".join(chunks)[:6000]  # cap to avoid token overflow

    prompt = f"""You are a professional training designer. Based on the following document content, create a structured training module for the role of {role}.

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

Generate exactly 4 topics and 10 quiz questions. Make content specific to the {role} role and the document. Return only valid JSON, no extra text."""

    raw = _call_claude(prompt)
    data = _parse_json(raw)

    # Validate structure
    if "topics" not in data or "quiz" not in data:
        raise ValueError("AI returned malformed training structure. Please try again.")

    logger.info("Generated %d topics and %d quiz questions for role '%s'",
                len(data["topics"]), len(data["quiz"]), role)
    return data
