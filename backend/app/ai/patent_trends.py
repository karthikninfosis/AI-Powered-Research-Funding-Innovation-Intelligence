from collections import Counter, defaultdict
from datetime import datetime
from typing import Iterable


def _filing_year(value) -> int | None:
    if isinstance(value, datetime):
        return value.year
    try:
        return int(str(value)[:4])
    except (TypeError, ValueError):
        return None


def calculate_trends(patents: Iterable[dict]) -> dict:
    yearly_counts: Counter[int] = Counter()
    domain_counts: Counter[str] = Counter()
    for patent in patents:
        year = _filing_year(patent.get("filing_date"))
        if year is not None:
            yearly_counts[year] += 1
        domain = patent.get("technology_domain")
        if domain:
            domain_counts[str(domain)] += 1

    by_year = [
        {"year": year, "count": count}
        for year, count in sorted(yearly_counts.items())
    ]
    previous_count = None
    yearly_growth = []
    for item in by_year:
        growth = None if previous_count in (None, 0) else round(
            ((item["count"] - previous_count) / previous_count) * 100, 2
        )
        yearly_growth.append({**item, "growth_percent": growth})
        previous_count = item["count"]

    return {
        "by_year": by_year,
        "by_domain": [
            {"technology_domain": domain, "count": count}
            for domain, count in domain_counts.most_common()
        ],
        "yearly_growth": yearly_growth,
    }


def calculate_competitors(patents: Iterable[dict]) -> list[dict]:
    competitors: dict[str, dict] = defaultdict(
        lambda: {"patent_count": 0, "citation_count": 0, "technology_domains": set()}
    )
    for patent in patents:
        assignee = str(patent.get("assignee", "")).strip()
        if not assignee:
            continue
        competitor = competitors[assignee]
        competitor["patent_count"] += 1
        competitor["citation_count"] += int(patent.get("citation_count") or 0)
        domain = patent.get("technology_domain")
        if domain:
            competitor["technology_domains"].add(str(domain))

    return [
        {
            "assignee": assignee,
            "patent_count": values["patent_count"],
            "citation_count": values["citation_count"],
            "technology_domains": sorted(values["technology_domains"]),
        }
        for assignee, values in sorted(
            competitors.items(),
            key=lambda item: (-item[1]["patent_count"], item[0].lower()),
        )
    ]


def calculate_innovation_map(patents: Iterable[dict]) -> list[dict]:
    domains: dict[str, dict] = defaultdict(
        lambda: {"patent_count": 0, "assignees": Counter(), "classifications": Counter()}
    )
    for patent in patents:
        domain = str(patent.get("technology_domain", "")).strip()
        if not domain:
            continue
        item = domains[domain]
        item["patent_count"] += 1
        if patent.get("assignee"):
            item["assignees"][str(patent["assignee"])] += 1
        if patent.get("classification"):
            item["classifications"][str(patent["classification"])] += 1

    return [
        {
            "technology_domain": domain,
            "patent_count": values["patent_count"],
            "top_assignees": [name for name, _ in values["assignees"].most_common(5)],
            "top_classifications": [
                name for name, _ in values["classifications"].most_common(5)
            ],
        }
        for domain, values in sorted(
            domains.items(), key=lambda item: (-item[1]["patent_count"], item[0].lower())
        )
    ]
