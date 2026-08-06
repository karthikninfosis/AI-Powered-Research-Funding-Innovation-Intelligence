import httpx

from app.config.settings import USER_SERVICE_URL
from app.utils.password import verify_password
from app.utils.jwt import create_access_token


async def login(data):
    base_url = USER_SERVICE_URL.rstrip("/")
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