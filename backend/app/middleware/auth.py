from fastapi import Cookie
from fastapi import Depends, HTTPException, Request
from jose import jwt
from jose.exceptions import JWTError
from app.config.settings import JWT_ALGORITHM, JWT_SECRET


def _decode_token(token: str):
    try:
        return jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
    except JWTError:
        return None


async def get_current_user(
    request: Request,
    access_token: str = Cookie(None)
):

    token = access_token

    # Also accept Authorization: Bearer <token> header (cross-domain)
    auth_header = request.headers.get("authorization", "")
    if not token and auth_header.lower().startswith("bearer "):
        token = auth_header[7:]

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    payload = _decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return payload

async def require_admin(user=Depends(get_current_user)):
    role = user.get("role")

    if not isinstance(role, str) or role.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user
