"""
Passport Agent — retrieves and formats volunteer workforce passports.
"""
from services.passport_service import get_passport, get_passport_by_id
from typing import Dict, Any, Optional


class PassportAgent:
    """Manages passport retrieval and formatting."""

    def get_by_volunteer(self, volunteer_id: str) -> Optional[Dict[str, Any]]:
        """Get most recent passport for a volunteer."""
        return get_passport(volunteer_id)

    def get_by_id(self, passport_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific passport by its ID — used for public sharing."""
        return get_passport_by_id(passport_id)

    def is_shift_ready(self, volunteer_id: str) -> bool:
        passport = self.get_by_volunteer(volunteer_id)
        return passport is not None and passport['status'] == 'SHIFT READY'
