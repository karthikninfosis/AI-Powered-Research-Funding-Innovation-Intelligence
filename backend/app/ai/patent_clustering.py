from typing import Iterable

from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer


def patent_text(patent: dict) -> str:
    """Return the searchable technical text for one patent document."""
    fields = ("title", "abstract", "technology_domain", "classification")
    return " ".join(str(patent.get(field, "")) for field in fields).strip()


def cluster_patents(patents: Iterable[dict], k: int) -> list[dict]:
    """Cluster patents with TF-IDF and return labels plus representative terms."""
    patent_list = list(patents)
    texts = [patent_text(patent) for patent in patent_list]
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        matrix = vectorizer.fit_transform(texts)
    except ValueError as exc:
        raise ValueError("Patent text does not contain enough terms to cluster") from exc

    if matrix.shape[1] == 0:
        raise ValueError("Patent text does not contain enough terms to cluster")

    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(matrix)
    terms = vectorizer.get_feature_names_out()
    clusters = []
    for cluster_id in range(k):
        top_indexes = kmeans.cluster_centers_[cluster_id].argsort()[::-1][:5]
        representative_terms = [terms[index] for index in top_indexes if kmeans.cluster_centers_[cluster_id][index] > 0]
        clusters.append(
            {
                "cluster_id": cluster_id,
                "representative_terms": representative_terms,
                "patent_indexes": [
                    index for index, label in enumerate(labels) if int(label) == cluster_id
                ],
            }
        )
    return clusters
