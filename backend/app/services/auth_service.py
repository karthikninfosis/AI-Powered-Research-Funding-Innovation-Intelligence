import httpx
from urllib.parse import urlparse

from app.config.settings import USER_SERVICE_URL
from app.utils.password import verify_password
from app.utils.jwt import create_access_token


def _is_local_url(url: str) -> bool:
    host = urlparse(url).hostname or ""
    return host in ("localhost", "127.0.0.1", "0.0.0.0", "::1")


async def login(data, request_base_url: str = ""):
    base_url = (USER_SERVICE_URL or "").strip()

    # USER_SERVICE_URL points at this same app; fall back to the
    # request's own base URL when it's missing or still localhost.
    if not base_url or _is_local_url(base_url):
        base_url = request_base_url

    base_url = base_url.rstrip("/")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{base_url}/api/users/email/{data.email}"
        )

    if response.status_code != 200:
        return None

    user = response.json()
    print(response.json())
    if not verify_password(
    data.password,
    user["password"]
        ):
        return None

    token = create_access_token({
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role_id"]
    })

    return {
        "token": token,
        "user": user
    }
