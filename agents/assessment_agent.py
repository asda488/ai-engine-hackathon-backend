"""
Assessment Agent — scores quiz submissions, calculates readiness breakdown, awards XP.
"""
from services.quiz_evaluator import evaluate_quiz
from typing import Dict, Any, List


class AssessmentAgent:
    """Evaluates a volunteer's quiz attempt and generates a result."""

    def run(self, volunteer_id: str, quiz_id: str, answers: List[Dict]) -> Dict[str, Any]:
        """
        Args:
            volunteer_id: UUID of the volunteer
            quiz_id: UUID of the quiz
            answers: list of {question_id: int, selected_option: int}

        Returns:
            {score, passed, readiness_score, breakdown, xp, passport_id}
        """
        return evaluate_quiz(volunteer_id, quiz_id, answers)
