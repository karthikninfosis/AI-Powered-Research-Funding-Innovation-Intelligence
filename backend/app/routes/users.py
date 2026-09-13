from fastapi import APIRouter, HTTPException
from bson.errors import InvalidId

from app.services import user_service
from app.schemas.user import UserCreate, UserUpdate

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


# ==============================
# GET ALL USERS
# ==============================

@router.get("/")
async def get_users():
    return user_service.get_users()


# ==============================
# GET USER BY ID
# ==============================

@router.get("/{id}")
async def get_user(id: str):

    try:
        user = user_service.get_user(id)

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid User ID"
        )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ==============================
# UPDATE USER
# ==============================

@router.put("/{id}")
async def update_user(
    id: str,
    body: UserUpdate
):

    try:
        data = body.model_dump(exclude_unset=True)

        result = user_service.update_user(
            id,
            data
        )

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid User ID"
        )

    if result == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User updated successfully"
    }


# ==============================
# CREATE USER
# ==============================

@router.post("/")
async def create_user(body: UserCreate):

    data = body.model_dump()

    result = user_service.create_user(data)

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return {
        "message": "User created successfully",
        "id": result
    }


# ==============================
# GET USER BY EMAIL
# ==============================

@router.get("/email/{email}")
async def get_user_email(email: str):

    user = user_service.get_user_by_email(email)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user