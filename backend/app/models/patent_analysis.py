class PatentAnalysisModel:
    """Small document-shaping helpers for computed patent analysis responses.

    Analysis is derived from the patents collection and therefore does not create
    a separate, stale MongoDB collection.
    """

    @staticmethod
    def cluster_document(
        cluster_id: int,
        representative_terms: list[str],
        patents: list[dict],
    ) -> dict:
        return {
            "cluster_id": cluster_id,
            "size": len(patents),
            "representative_terms": representative_terms,
            "patents": patents,
        }
