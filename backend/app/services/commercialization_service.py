from typing import List


# Sample commercialization knowledge base
COMMERCIALIZATION_OPTIONS = [
    {
        "technology": "Artificial Intelligence",
        "keywords": [
            "artificial intelligence",
            "ai",
            "machine learning",
            "deep learning",
            "neural network"
        ],
        "commercialization_path": "Product Development",
        "target_market": "Technology and Software Industry",
        "reason": "AI-based innovations can be developed into software products and intelligent services."
    },
    {
        "technology": "Autonomous Vehicle Technology",
        "keywords": [
            "vehicle",
            "automotive",
            "autonomous",
            "self driving",
            "driverless",
            "vehicle control"
        ],
        "commercialization_path": "Industry Partnership",
        "target_market": "Automotive and Transportation Industry",
        "reason": "Vehicle technologies can be commercialized through partnerships with automotive manufacturers."
    },
    {
        "technology": "Healthcare AI",
        "keywords": [
            "healthcare",
            "medical",
            "health",
            "diagnosis",
            "disease",
            "patient"
        ],
        "commercialization_path": "Product Development",
        "target_market": "Healthcare Industry",
        "reason": "Healthcare AI solutions can be commercialized as diagnostic and healthcare support products."
    },
    {
        "technology": "Agricultural Technology",
        "keywords": [
            "agriculture",
            "farming",
            "crop",
            "farmer",
            "irrigation",
            "soil"
        ],
        "commercialization_path": "Product Development",
        "target_market": "Agriculture Industry",
        "reason": "Agricultural innovations can be converted into smart farming products and services."
    },
    {
        "technology": "Cybersecurity",
        "keywords": [
            "cybersecurity",
            "cyber security",
            "security",
            "phishing",
            "malware",
            "network security"
        ],
        "commercialization_path": "SaaS / Software Product",
        "target_market": "Cybersecurity and Enterprise Industry",
        "reason": "Cybersecurity solutions can be offered as enterprise software or security services."
    },
    {
        "technology": "Internet of Things",
        "keywords": [
            "iot",
            "internet of things",
            "sensor",
            "smart device",
            "connected device"
        ],
        "commercialization_path": "Hardware + Software Product",
        "target_market": "IoT and Smart Systems Industry",
        "reason": "IoT innovations can combine connected hardware with software services."
    }
]


def calculate_score(text: str, keywords: List[str]) -> float:
    """
    Calculate a simple keyword matching score.
    """

    text = text.lower()

    matched_keywords = 0

    for keyword in keywords:
        if keyword.lower() in text:
            matched_keywords += 1

    if matched_keywords == 0:
        return 0.0

    score = (matched_keywords / len(keywords)) * 100

    return round(score, 2)


def generate_recommendations(
    title: str,
    abstract: str,
    technology: str | None = None,
    domain: str | None = None
):
    """
    Generate commercialization recommendations.
    """

    combined_text = " ".join(
        [
            title or "",
            abstract or "",
            technology or "",
            domain or ""
        ]
    ).lower()

    recommendations = []

    for option in COMMERCIALIZATION_OPTIONS:

        score = calculate_score(
            combined_text,
            option["keywords"]
        )

        if score > 0:

            recommendations.append(
                {
                    "technology": option["technology"],
                    "commercialization_path": option["commercialization_path"],
                    "target_market": option["target_market"],
                    "recommendation_score": score,
                    "reason": option["reason"]
                }
            )

    # If no exact keyword match
    if not recommendations:

        recommendations.append(
            {
                "technology": technology or "General Technology",
                "commercialization_path": "Product Development",
                "target_market": domain or "General Market",
                "recommendation_score": 50.0,
                "reason": (
                    "The innovation can initially be evaluated "
                    "through product development and market validation."
                )
            }
        )

    # Highest score first
    recommendations.sort(
        key=lambda x: x["recommendation_score"],
        reverse=True
    )

    # Return top 5
    return recommendations[:5]