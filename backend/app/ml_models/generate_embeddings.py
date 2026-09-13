import pandas as pd
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

CSV_PATH = BASE_DIR / "data" / "grants.csv"
EMBEDDINGS_PATH = BASE_DIR / "ml_models" / "grant_embeddings.npy"


# --------------------------------------------------
# Load grants
# --------------------------------------------------

print("Loading grants...")

grants = pd.read_csv(CSV_PATH)

print(f"Total grants: {len(grants)}")


# --------------------------------------------------
# Create grant text
# --------------------------------------------------

print("Preparing grant text...")

grant_texts = []

for _, grant in grants.iterrows():

    title = str(grant.get("opportunity_title", ""))
    agency = str(grant.get("agency_name", ""))
    category = str(
        grant.get("category_of_funding_activity", "")
    )

    text = f"""
    Grant Title: {title}
    Agency: {agency}
    Category: {category}
    """

    grant_texts.append(text)


# --------------------------------------------------
# Load embedding model
# --------------------------------------------------

print("Loading embedding model...")

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("Embedding model loaded.")


# --------------------------------------------------
# Generate embeddings
# --------------------------------------------------

print("Generating grant embeddings...")

embeddings = model.encode(
    grant_texts,
    show_progress_bar=True,
    batch_size=64
)


# --------------------------------------------------
# Save embeddings
# --------------------------------------------------

print("Saving embeddings...")

np.save(
    EMBEDDINGS_PATH,
    embeddings
)

print(
    f"Embeddings saved successfully: "
    f"{EMBEDDINGS_PATH}"
)

print(f"Embedding shape: {embeddings.shape}")