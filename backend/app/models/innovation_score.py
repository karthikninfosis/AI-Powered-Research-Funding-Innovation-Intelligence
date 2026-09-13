from datetime import datetime


class InnovationScoreModel:

    @staticmethod
    def create_document(data: dict):

        return {
            "user_id": data.get("user_id"),
            "research_id": data.get("research_id"),
            "scores": data["scores"],
            "weights": data["weights"],
            "innovation_score": data["innovation_score"],
            "innovation_level": data["innovation_level"],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }