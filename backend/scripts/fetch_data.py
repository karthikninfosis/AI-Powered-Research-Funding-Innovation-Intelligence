import os
import urllib.request
from pathlib import Path

REPO = "karthikninfosis/AI-Powered-Research-Funding-Innovation-Intelligence"
BASE_URL = f"https://github.com/{REPO}/releases/latest/download"

BASE_DIR = Path(__file__).resolve().parent.parent

FILES = {
    "datasets.csv": (
        BASE_DIR / "app" / "data" / "datasets.csv",
        os.getenv("DATASETS_URL", f"{BASE_URL}/datasets.csv"),
    ),
    "grant_embeddings.npy": (
        BASE_DIR / "app" / "ml_models" / "grant_embeddings.npy",
        os.getenv("EMBEDDINGS_URL", f"{BASE_URL}/grant_embeddings.npy"),
    ),
}


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)

    if dest.exists() and dest.stat().st_size > 0:
        print(f"[data] already present: {dest}")
        return

    print(f"[data] downloading {dest.name} from {url}")
    urllib.request.urlretrieve(url, dest)
    print(f"[data] downloaded {dest.name} ({dest.stat().st_size} bytes)")


def main() -> None:
    for name, (dest, url) in FILES.items():
        try:
            download(url, dest)
        except Exception as e:
            print(f"[data] FAILED to fetch {name}: {e}")
            raise


if __name__ == "__main__":
    main()