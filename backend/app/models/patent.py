from datetime import datetime


class PatentModel:
    """Factory for documents persisted in the ``patents`` collection."""

    @staticmethod
    def create_document(data: dict) -> dict:
        now = datetime.utcnow()
        return {
            "user_id": data["user_id"],
            "title": data["title"],
            "patent_number": data["patent_number"],
            "status": data["status"],
            # An ISO date string makes date-only patent filing dates unambiguous.
            "filing_date": data["filing_date"],
            "assignee": data["assignee"],
            "technology_domain": data["technology_domain"],
            "classification": data["classification"],
            "citation_count": data["citation_count"],
            "abstract": data["abstract"],
            "created_at": now,
            "updated_at": now,
        }
