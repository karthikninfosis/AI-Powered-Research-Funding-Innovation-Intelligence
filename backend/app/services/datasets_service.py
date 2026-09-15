import csv
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


# =========================================================
# CSV COUNT
# =========================================================

def get_csv_count(path: Path) -> int:

    count = 0

    with open(
        path,
        "r",
        encoding="latin1",
        errors="replace",
        newline=""
    ) as file:

        reader = csv.reader(file)

        # Skip header
        next(reader, None)

        for _ in reader:
            count += 1

    return count


# =========================================================
# EXCEL COUNT
# =========================================================

def get_excel_count(path: Path) -> int:
    df = pd.read_excel(path)
    return len(df)


# =========================================================
# DATASET COUNT
# =========================================================

def get_dataset_count(dataset: str) -> int:

    path = get_dataset_path(dataset)

    if path.suffix.lower() == ".csv":
        return get_csv_count(path)

    if path.suffix.lower() in [".xlsx", ".xls"]:
        return get_excel_count(path)

    raise ValueError("Unsupported dataset format")


# =========================================================
# CSV SEARCH
# =========================================================

def search_csv(
    path: Path,
    search: str = None,
    page: int = 1,
    page_size: int = 20
):

    start = (page - 1) * page_size

    results = []
    total_matches = 0

    search_lower = search.lower() if search else None

    with open(
        path,
        "r",
        encoding="latin1",
        errors="replace",
        newline=""
    ) as file:

        reader = csv.DictReader(file)

        for row in reader:

            # Search
            if search_lower:

                found = False

                for value in row.values():

                    if value is not None:

                        if search_lower in str(value).lower():
                            found = True
                            break

                if not found:
                    continue

            total_matches += 1

            # Pagination
            if total_matches > start and len(results) < page_size:
                results.append(row)

    return {
        "page": page,
        "page_size": page_size,
        "total_matches": total_matches,
        "records": results
    }


# =========================================================
# EXCEL SEARCH
# =========================================================

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
                na=False,
                regex=False
            ).any(),
            axis=1
        )

        df = df[mask]

    total_matches = len(df)

    start = (page - 1) * page_size
    end = start + page_size

    selected = df.iloc[start:end]

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


# =========================================================
# SEARCH DATASET
# =========================================================

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