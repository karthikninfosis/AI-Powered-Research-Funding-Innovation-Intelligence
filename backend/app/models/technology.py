from datetime import datetime


class TechnologyModel:

    @staticmethod
    def create_document(
        name: str,
        domain: str,
        description: str,
        maturity_level: str = "Emerging",
        maturity_score: float = 0,
        adoption_level: str = "Low",
        adoption_score: float = 0,
    ) -> dict:

        return {
            "name": name,
            "domain": domain,
            "description": description,

            "maturity": {
                "level": maturity_level,
                "score": maturity_score
            },

            "adoption": {
                "level": adoption_level,
                "score": adoption_score
            },

            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }