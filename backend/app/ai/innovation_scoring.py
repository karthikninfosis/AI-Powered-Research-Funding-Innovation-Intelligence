from app.constants.innovation_weights import (
    RESEARCH_NOVELTY_WEIGHT,
    PATENT_STRENGTH_WEIGHT,
    TECHNOLOGY_MATURITY_WEIGHT,
    MARKET_POTENTIAL_WEIGHT,
    FUNDING_RELEVANCE_WEIGHT
)


def calculate_innovation_score(
    research_novelty,
    patent_strength,
    technology_maturity,
    market_potential,
    funding_relevance
):

    score = (
        research_novelty * RESEARCH_NOVELTY_WEIGHT +
        patent_strength * PATENT_STRENGTH_WEIGHT +
        technology_maturity * TECHNOLOGY_MATURITY_WEIGHT +
        market_potential * MARKET_POTENTIAL_WEIGHT +
        funding_relevance * FUNDING_RELEVANCE_WEIGHT
    )

    return round(score, 2)


def classify_innovation_score(score):

    if score < 40:
        return "Low"
    elif score < 60:
        return "Moderate"
    elif score < 80:
        return "High"
    else:
        return "Very High"