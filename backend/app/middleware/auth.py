from fastapi import Cookie
from fastapi import Depends, HTTPException, status
from jose import jwt
from jose.exceptions import JWTError
from app.config.settings import JWT_EXPIRE_MINUTES,JWT_ALGORITHM,JWT_SECRET


async def get_current_user(
    access_token: str = Cookie(None)
):

    if access_token is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    try:
        payload = jwt.decode(
            access_token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

async def require_admin(user=Depends(get_current_user)):
    ADMIN_ROLE_ID = "6a79dc6dc52f028d0dfee2c7"

    if user.get("role") != ADMIN_ROLE_ID:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user