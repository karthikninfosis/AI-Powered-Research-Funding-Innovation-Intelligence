import pandas as pd
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

CSV_PATH = BASE_DIR / "data" / "grants.csv"
EMBEDDINGS_PATH = BASE_DIR / "ml_models" / "grant_embeddings.npy"


# --------------------------------------------------
# Load model
# --------------------------------------------------

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Embedding model loaded.")


# --------------------------------------------------
# Load grants
# --------------------------------------------------

print("Loading grants...")

grants = pd.read_csv(CSV_PATH)

print(f"Total grants: {len(grants)}")


# --------------------------------------------------
# Load existing embeddings
# --------------------------------------------------

print("Loading grant embeddings...")

grant_embeddings = np.load(EMBEDDINGS_PATH)

print(f"Embeddings loaded: {grant_embeddings.shape}")


# --------------------------------------------------
# Recommendation function
# --------------------------------------------------

def recommend_grants(
    innovation_description: str,
    top_k: int = 5
):

    # Convert user innovation into embedding
    user_embedding = model.encode(
        [innovation_description]
    )

    # Compare user embedding with all grants
    similarities = cosine_similarity(
        user_embedding,
        grant_embeddings
    )[0]

    # Get indexes of highest scores
    top_indices = np.argsort(
        similarities
    )[-top_k:][::-1]

    recommendations = []

    for rank, index in enumerate(top_indices, start=1):

        grant = grants.iloc[index]

        recommendations.append({
            "rank": rank,

            "grant_id": str(
                grant.get("id", "")
            ),

            "title": str(
                grant.get(
                    "opportunity_title",
                    ""
                )
            ),

            "agency": str(
                grant.get(
                    "agency_name",
                    ""
                )
            ),

            "category": str(
                grant.get(
                    "category_of_funding_activity",
                    ""
                )
            ),

            "match_score": round(
                float(similarities[index]) * 100,
                2
            )
        })

    return recommendations


# --------------------------------------------------
# Test recommendation
# --------------------------------------------------

if __name__ == "__main__":

    innovation = """
    I am building a software system that uses
    artificial intelligence to control vehicles.
    The system can detect road conditions,
    identify obstacles and improve vehicle safety.
    """

    print("\nSearching for funding opportunities...\n")

    results = recommend_grants(
        innovation,
        top_k=5
    )

    for result in results:

        print("--------------------------------")
        print(f"Rank: {result['rank']}")
        print(f"Grant ID: {result['grant_id']}")
        print(f"Title: {result['title']}")
        print(f"Agency: {result['agency']}")
        print(f"Category: {result['category']}")
        print(f"Match: {result['match_score']}%")