"""Authentication and reusable authorization dependencies."""

from datetime import datetime, timedelta, timezone
from typing import Any, Annotated

import bcrypt
import jwt
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

from app.config.database import db
from app.config.settings import JWT_ALGORITHM, JWT_EXPIRE_MINUTES, JWT_SECRET
from app.schemas.user import UserCreate

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)
# This is intentionally process-local.  Clients should also discard the token on logout.
_revoked_tokens: set[str] = set()


class LoginRequest(BaseModel):
    """Credentials accepted by the login endpoint."""

    email: EmailStr
    password: str = Field(min_length=6)


def response(message: str, data: Any = None) -> dict[str, Any]:
    """Build the API's standard successful response envelope."""

    return {"success": True, "message": message, "data": data if data is not None else {}}


def serialize_user(user: dict[str, Any]) -> dict[str, Any]:
    """Return a user without its password hash."""

    return {
        "id": str(user["_id"]),
        "user_id": user.get("user_id"),
        "name": user.get("name"),
        "email": user.get("email"),
        "role_id": str(user["role_id"]) if user.get("role_id") else None,
        "is_active": user.get("is_active", True),
        "last_active": user.get("last_active"),
        "created_at": user.get("created_at"),
        "updated_at": user.get("updated_at"),
    }


def _new_user_id() -> str:
    last_user = db.users.find_one({}, sort=[("user_id", -1)])
    number = int(last_user["user_id"].replace("USER", "")) + 1 if last_user and last_user.get("user_id") else 1
    return f"USER{number:03d}"


def _token_for(user: dict[str, Any]) -> str:
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT_SECRET is not configured")
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user["_id"]), "exp": expires_at}, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict[str, Any]:
    """Validate a bearer token and return its active database user."""

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required", headers={"WWW-Authenticate": "Bearer"})
    if credentials.credentials in _revoked_tokens:
        raise HTTPException(status_code=401, detail="Token has been revoked", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Token has no subject")
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except (jwt.PyJWTError, InvalidId, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token", headers={"WWW-Authenticate": "Bearer"}) from None
    if not user:
        raise HTTPException(status_code=401, detail="User not found", headers={"WWW-Authenticate": "Bearer"})
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account is inactive")
    return user


def require_permission(permission_code: str):
    """Create a dependency that permits admins or roles holding ``permission_code``."""

    async def checker(current_user: Annotated[dict[str, Any], Depends(get_current_user)]) -> dict[str, Any]:
        role_id = current_user.get("role_id")
        role = db.roles.find_one({"_id": role_id}) if role_id else None
        if not role:
            raise HTTPException(status_code=403, detail="User has no valid role")
        role_code = str(role.get("code", "")).upper()
        permissions = {str(item).upper() for item in role.get("permissions", [])}
        if role_code != "ADMIN" and permission_code.upper() not in permissions:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user

    return checker


async def require_admin(current_user: Annotated[dict[str, Any], Depends(get_current_user)]) -> dict[str, Any]:
    """Require the current user's role code to be ``ADMIN``."""

    role_id = current_user.get("role_id")
    role = db.roles.find_one({"_id": role_id}) if role_id else None
    if not role or str(role.get("code", "")).upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate) -> dict[str, Any]:
    """Register an active user against an existing role."""

    if db.users.find_one({"email": body.email.lower()}):
        raise HTTPException(status_code=422, detail="Email already exists")
    try:
        role_id = ObjectId(body.role_id)
    except InvalidId:
        raise HTTPException(status_code=422, detail="Invalid role_id") from None
    if not db.roles.find_one({"_id": role_id}):
        raise HTTPException(status_code=404, detail="Role not found")
    now = datetime.utcnow()
    user = {"user_id": _new_user_id(), "name": body.name, "email": body.email.lower(), "password": bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode(), "role_id": role_id, "is_active": body.is_active, "last_active": None, "created_at": now, "updated_at": now}
    result = db.users.insert_one(user)
    user["_id"] = result.inserted_id
    return response("User registered successfully", {"user": serialize_user(user)})


@router.post("/login")
async def login(body: LoginRequest) -> dict[str, Any]:
    """Verify credentials and issue a JWT bearer token."""

    user = db.users.find_one({"email": body.email.lower()})
    if not user or not bcrypt.checkpw(body.password.encode(), user.get("password", "").encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password", headers={"WWW-Authenticate": "Bearer"})
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account is inactive")
    db.users.update_one({"_id": user["_id"]}, {"$set": {"last_active": datetime.utcnow()}})
    return response("Login successful", {"access_token": _token_for(user), "token_type": "bearer", "user": serialize_user(user)})


@router.get("/me")
async def me(current_user: Annotated[dict[str, Any], Depends(get_current_user)]) -> dict[str, Any]:
    """Return the authenticated user's profile."""

    return response("Current user retrieved", serialize_user(current_user))


@router.post("/logout")
async def logout(request: Request, credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)], _: Annotated[dict[str, Any], Depends(get_current_user)]) -> dict[str, Any]:
    """Invalidate the current token for this process; clients must delete it too."""

    del request
    if credentials:
        _revoked_tokens.add(credentials.credentials)
    return response("Logged out successfully")
