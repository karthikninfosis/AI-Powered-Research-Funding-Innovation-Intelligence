from bson import ObjectId
from datetime import datetime

from app.config.database import db
from app.models.innovation_score import InnovationScoreModel
from app.ai.innovation_scoring import calculate_innovation_score, classify_innovation_score
from app.constants.innovation_weights import (
    RESEARCH_NOVELTY_WEIGHT,
    PATENT_STRENGTH_WEIGHT,
    TECHNOLOGY_MATURITY_WEIGHT,
    MARKET_POTENTIAL_WEIGHT,
    FUNDING_RELEVANCE_WEIGHT
)


innovation_scores_collection = db.innovation_scores


class InnovationScoreService:

    @staticmethod
    async def create_innovation_score(data, user_id=None):

        score = calculate_innovation_score(
            data.research_novelty,
            data.patent_strength,
            data.technology_maturity,
            data.market_potential,
            data.funding_relevance
        )

        level = classify_innovation_score(score)

        document = InnovationScoreModel.create_document({
            "user_id": user_id,
            "research_id": data.research_id,
            "scores": {
                "research_novelty": data.research_novelty,
                "patent_strength": data.patent_strength,
                "technology_maturity": data.technology_maturity,
                "market_potential": data.market_potential,
                "funding_relevance": data.funding_relevance
            },
            "weights": {
                "research_novelty": RESEARCH_NOVELTY_WEIGHT,
                "patent_strength": PATENT_STRENGTH_WEIGHT,
                "technology_maturity": TECHNOLOGY_MATURITY_WEIGHT,
                "market_potential": MARKET_POTENTIAL_WEIGHT,
                "funding_relevance": FUNDING_RELEVANCE_WEIGHT
            },
            "innovation_score": score,
            "innovation_level": level
        })

        result = innovation_scores_collection.insert_one(document)

        document["_id"] = str(result.inserted_id)

        return document


    @staticmethod
    async def get_innovation_score(score_id):

        result = innovation_scores_collection.find_one({"_id": ObjectId(score_id)})

        if not result:
            return None

        result["_id"] = str(result["_id"])

        return result


    @staticmethod
    async def get_my_innovation_scores(user_id):

        scores = []

        cursor = innovation_scores_collection.find({"user_id": user_id})

        for score in cursor:
            score["_id"] = str(score["_id"])
            scores.append(score)

        return scores