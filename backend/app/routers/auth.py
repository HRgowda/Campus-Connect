from fastapi import APIRouter, status, Response, Depends
from app.utils import get_current_user
from app.schemas import UserResponse

router = APIRouter(tags=["Auth"])

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax"
    )
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = current_user["user"]
    role = current_user["role"]
    
    return UserResponse(
        id=user.id,
        email=getattr(user, "email", None),
        usn=getattr(user, "usn", None),
        role=role,
        name=user.name
    )
