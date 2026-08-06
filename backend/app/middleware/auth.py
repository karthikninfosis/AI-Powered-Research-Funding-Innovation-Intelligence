from fastapi import Cookie
from fastapi import HTTPException
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