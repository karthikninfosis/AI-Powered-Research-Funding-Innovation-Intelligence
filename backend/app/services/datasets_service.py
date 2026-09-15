import pandas as pd
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


DATASET_PATHS = {
    "datasets": DATA_DIR / "datasets.csv",
    "grants": DATA_DIR / "grants.csv",
    "patents": DATA_DIR / "patentbrief-patents.csv",
    "technology": DATA_DIR / "technology_dataset.csv",
}


def get_dataset_path(dataset: str):
    path = DATASET_PATHS.get(dataset)

    if not path:
        raise ValueError(f"Unknown dataset: {dataset}")

    if not path.exists():
        raise FileNotFoundError(
            f"Dataset file not found: {path}"
        )

    return path


def get_csv_count(path: Path) -> int:
    count = 0

    for chunk in pd.read_csv(
        path,
        chunksize=10000,
        low_memory=False,
        encoding="latin1"
    ):
        count += len(chunk)

    return count


def get_excel_count(path: Path) -> int:
    df = pd.read_excel(path)
    return len(df)


def get_dataset_count(dataset: str) -> int:
    path = get_dataset_path(dataset)

    if path.suffix.lower() == ".csv":
        return get_csv_count(path)

    if path.suffix.lower() in [".xlsx", ".xls"]:
        return get_excel_count(path)

    raise ValueError("Unsupported dataset format")


def search_csv(path: Path, search: str = None, page: int = 1, page_size: int = 100):
    start = (page - 1) * page_size
    results = []
    matched_count = 0

    for chunk in pd.read_csv(
        path,
        chunksize=10000,
        low_memory=False,
        encoding="latin1"
    ):
        if search:
            search_lower = search.lower()

            mask = chunk.astype(str).apply(
                lambda row: row.str.lower().str.contains(
                    search_lower,
                    na=False,
                    regex=False
                ).any(),
                axis=1
            )

            chunk = chunk[mask]

        matched_count += len(chunk)

        if matched_count > start and len(results) < page_size:

            chunk_start = max(
                0,
                start - (matched_count - len(chunk))
            )

            chunk_end = min(
                len(chunk),
                chunk_start + page_size - len(results)
            )

            selected = chunk.iloc[chunk_start:chunk_end]

            # Convert NaN / NaT to None
            selected = selected.astype(object).where(
                pd.notna(selected),
                None
            )

            results.extend(
                selected.to_dict(orient="records")
            )

    return {
        "page": page,
        "page_size": page_size,
        "total_matches": matched_count,
        "records": results
    }
def search_excel(
    path: Path,
    search: str = None,
    page: int = 1,
    page_size: int = 20
):
    df = pd.read_excel(path)

    if search:
        search_lower = search.lower()

        mask = df.astype(str).apply(
            lambda row: row.str.lower().str.contains(
                search_lower,
                na=False
            ).any(),
            axis=1
        )

        df = df[mask]

    total_matches = len(df)

    start = (page - 1) * page_size
    end = start + page_size

    selected = df.iloc[start:end]

# Convert NaN/NaT values to None for valid JSON
    selected = selected.astype(object).where(
        pd.notna(selected),
        None
    )

    records = selected.to_dict(
        orient="records"
    )

    return {
        "page": page,
        "page_size": page_size,
        "total_matches": total_matches,
        "records": records
    }


def search_dataset(
    dataset: str,
    search: str = None,
    page: int = 1,
    page_size: int = 20
):
    path = get_dataset_path(dataset)

    if path.suffix.lower() == ".csv":
        return search_csv(
            path,
            search,
            page,
            page_size
        )

    if path.suffix.lower() in [".xlsx", ".xls"]:
        return search_excel(
            path,
            search,
            page,
            page_size
        )

    raise ValueError("Unsupported dataset format")