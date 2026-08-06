from fastapi import APIRouter, Depends, Response, HTTPException
from fastapi import HTTPException
from fastapi import Response
from app.middleware.auth import get_current_user
from app.schemas.auth import LoginRequest
from app.services.auth_service import login

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login")
async def login_user(
    data: LoginRequest,
    response: Response
):

    result = await login(data)

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    response.set_cookie(
        key="access_token",
        value=result["token"],
        httponly=True,
        secure=False,      # True in production with HTTPS
        samesite="lax",
        max_age=3600,
    )

    return {
        "message": "Login successful",
        "user": result["user"]
    }
@router.get("/me")
async def me(user=Depends(get_current_user)):
    return user

@router.post("/logout")
async def logout_user(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}