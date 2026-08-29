def calculate_maturity_level(score: float) -> str:
    """
    Convert maturity score into a maturity level.
    """

    if score >= 80:
        return "Mature"

    elif score >= 60:
        return "Developing"

    elif score >= 40:
        return "Emerging"

    else:
        return "Early Stage"


def calculate_adoption_level(score: float) -> str:
    """
    Convert adoption score into an adoption level.
    """

    if score >= 75:
        return "High"

    elif score >= 50:
        return "Medium"

    elif score >= 25:
        return "Low"

    else:
        return "Very Low"


def calculate_opportunity_score(
    maturity_score: float,
    adoption_score: float
) -> float:
    """
    Calculate innovation opportunity score.

    Maturity = 40%
    Adoption = 60%
    """

    score = (
        maturity_score * 0.40
        + adoption_score * 0.60
    )

    return round(score, 2)


def calculate_opportunity_level(score: float) -> str:

    if score >= 75:
        return "High Opportunity"

    elif score >= 50:
        return "Moderate Opportunity"

    elif score >= 25:
        return "Potential Opportunity"

    else:
        return "Low Opportunity"


def analyze_maturity(score: float) -> dict:

    return {
        "level": calculate_maturity_level(score),
        "score": round(score, 2)
    }


def analyze_adoption(score: float) -> dict:

    return {
        "level": calculate_adoption_level(score),
        "score": round(score, 2)
    }


def analyze_opportunity(
    maturity_score: float,
    adoption_score: float
) -> dict:

    opportunity_score = calculate_opportunity_score(
        maturity_score,
        adoption_score
    )

    return {
        "opportunity_score": opportunity_score,
        "opportunity_level": calculate_opportunity_level(
            opportunity_score
        )
    }