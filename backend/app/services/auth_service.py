import httpx

from app.config.settings import USER_SERVICE_URL
from app.services.role_service import RoleService
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
    if not verify_password(
    data.password,
    user["password"]
        ):
        return None

    role = await RoleService.get_role_by_id(user.get("role_id"))
    role_code = role.get("code") if role else None

    if not isinstance(role_code, str) or not role_code.strip():
        return None

    token = create_access_token({
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": role_code.lower()
    })

    return {
        "token": token,
        "user": user
    }
