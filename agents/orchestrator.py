"""
Orchestrator — coordinates the full ShiftPass pipeline:
  Document upload → Training generation → Quiz → Assessment → Passport
"""
from agents.document_agent import DocumentAgent
from agents.training_agent import TrainingAgent
from agents.quiz_agent import QuizAgent
from agents.assessment_agent import AssessmentAgent
from agents.passport_agent import PassportAgent
from typing import Dict, Any, List


class ShiftPassOrchestrator:
    """
    End-to-end pipeline orchestrator for ShiftPass.

    Employer flow:
        1. upload_document()      — ingest PDF/TXT
        2. generate_training()    — create module + quiz from document

    Volunteer flow:
        3. get_quiz()             — fetch questions (sanitized)
        4. submit_quiz()          — score attempt, issue passport
        5. get_passport()         — view shareable passport
    """

    def __init__(self):
        self.document_agent = DocumentAgent()
        self.training_agent = TrainingAgent()
        self.quiz_agent = QuizAgent()
        self.assessment_agent = AssessmentAgent()
        self.passport_agent = PassportAgent()

    # ── Employer flows ──────────────────────────────────────────────────────

    def upload_document(self, file_bytes: bytes, filename: str, employer_id: str) -> Dict[str, Any]:
        """Step 1: Ingest a document from the employer."""
        return self.document_agent.run(file_bytes, filename, employer_id)

    def generate_training(self, document_id: str, role: str) -> Dict[str, Any]:
        """Step 2: Generate training module + quiz from an ingested document."""
        return self.training_agent.run(document_id, role)

    # ── Volunteer flows ─────────────────────────────────────────────────────

    def get_quiz(self, training_module_id: str) -> Dict[str, Any]:
        """Step 3: Get quiz questions (no answers) for a training module."""
        return self.quiz_agent.get_for_volunteer(training_module_id)

    def submit_quiz(self, volunteer_id: str, quiz_id: str, answers: List[Dict]) -> Dict[str, Any]:
        """Step 4: Score the quiz and issue a passport."""
        return self.assessment_agent.run(volunteer_id, quiz_id, answers)

    def get_passport(self, volunteer_id: str) -> Dict[str, Any]:
        """Step 5: Retrieve the volunteer's workforce passport."""
        passport = self.passport_agent.get_by_volunteer(volunteer_id)
        if not passport:
            raise ValueError(f"No passport found for volunteer {volunteer_id}")
        return passport

    def get_passport_by_id(self, passport_id: str) -> Dict[str, Any]:
        """Get a specific passport by ID — for public shareable links."""
        passport = self.passport_agent.get_by_id(passport_id)
        if not passport:
            raise ValueError(f"Passport {passport_id} not found")
        return passport
