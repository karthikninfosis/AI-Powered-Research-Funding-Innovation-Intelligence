from datetime import datetime, timedelta
from jose import jwt

from app.config.settings import JWT_EXPIRE_MINUTES,JWT_ALGORITHM,JWT_SECRET


def create_access_token(data: dict):
    payload = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=JWT_EXPIRE_MINUTES
    )

    payload.update({"exp": expire})

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )