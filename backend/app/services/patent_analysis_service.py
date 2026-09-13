import re
from typing import Optional

from app.ai.patent_clustering import cluster_patents
from app.ai.patent_trends import (
    calculate_competitors,
    calculate_innovation_map,
    calculate_trends,
)
from app.models.patent_analysis import PatentAnalysisModel
from app.services.patent_service import patents_collection, serialize_patent


class InvalidClusterRequestError(Exception):
    pass


def _equals_case_insensitive(value: str) -> dict:
    return {"$regex": f"^{re.escape(value.strip())}$", "$options": "i"}


def _analysis_filter(
    technology_domain: Optional[str] = None,
    assignee: Optional[str] = None,
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
) -> dict:
    query = {}
    if technology_domain and technology_domain.strip():
        query["technology_domain"] = _equals_case_insensitive(technology_domain)
    if assignee and assignee.strip():
        query["assignee"] = _equals_case_insensitive(assignee)
    if start_year is not None or end_year is not None:
        # Filing dates are canonical ISO date strings, so lexical comparison is chronological.
        filing_range = {}
        if start_year is not None:
            filing_range["$gte"] = f"{start_year:04d}-01-01"
        if end_year is not None:
            filing_range["$lte"] = f"{end_year:04d}-12-31"
        query["filing_date"] = filing_range
    return query


def search_patents(
    q: Optional[str] = None,
    technology_domain: Optional[str] = None,
    assignee: Optional[str] = None,
    status: Optional[str] = None,
    filing_year: Optional[int] = None,
    limit: int = 20,
    skip: int = 0,
) -> dict:
    query = {}
    if q and q.strip():
        pattern = re.escape(q.strip())
        query["$or"] = [
            {field: {"$regex": pattern, "$options": "i"}}
            for field in (
                "title",
                "abstract",
                "patent_number",
                "technology_domain",
                "assignee",
                "classification",
            )
        ]
    if technology_domain and technology_domain.strip():
        query["technology_domain"] = _equals_case_insensitive(technology_domain)
    if assignee and assignee.strip():
        query["assignee"] = _equals_case_insensitive(assignee)
    if status and status.strip():
        query["status"] = _equals_case_insensitive(status)
    if filing_year is not None:
        query["filing_date"] = {"$regex": f"^{filing_year:04d}-"}

    total = patents_collection.count_documents(query)
    results = [
        serialize_patent(patent)
        for patent in patents_collection.find(query).sort("filing_date", -1).skip(skip).limit(limit)
    ]
    return {
        "query": q.strip() if q and q.strip() else None,
        "total": total,
        "limit": limit,
        "skip": skip,
        "results": results,
    }


def get_clusters(k: int) -> dict:
    patents = list(patents_collection.find().sort("filing_date", -1))
    if len(patents) < 2:
        raise InvalidClusterRequestError("At least two patents are required for clustering")
    if k > len(patents):
        raise InvalidClusterRequestError("k cannot exceed the number of available patents")
    try:
        cluster_data = cluster_patents(patents, k)
    except ValueError as exc:
        raise InvalidClusterRequestError(str(exc)) from exc

    return {
        "clusters": [
            PatentAnalysisModel.cluster_document(
                cluster_id=cluster["cluster_id"],
                representative_terms=cluster["representative_terms"],
                patents=[
                    serialize_patent(patents[index])
                    for index in cluster["patent_indexes"]
                ],
            )
            for cluster in cluster_data
        ]
    }


def get_trends(
    technology_domain: Optional[str] = None,
    assignee: Optional[str] = None,
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
) -> dict:
    return calculate_trends(
        patents_collection.find(
            _analysis_filter(technology_domain, assignee, start_year, end_year)
        )
    )


def get_competitors(technology_domain: Optional[str] = None) -> dict:
    query = _analysis_filter(technology_domain=technology_domain)
    return {"competitors": calculate_competitors(patents_collection.find(query))}



def get_innovation_map(technology_domain: Optional[str] = None) -> dict:
    query = _analysis_filter(technology_domain=technology_domain)
    return {"technology_map": calculate_innovation_map(patents_collection.find(query))}
