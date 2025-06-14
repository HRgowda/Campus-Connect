from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import CreateProfessor, UserResponse, ProfessorLogin, Token
from app.services.auth_service import ProfessorAuthService

router = APIRouter(
    prefix="/professor",
    tags=["Professor Management"],
)

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(professor_data: CreateProfessor, db: Session = Depends(get_db)):
    auth_service = ProfessorAuthService(db)
    return auth_service.register_Professor(professor_data)

@router.post("/signin", response_model=Token, status_code=status.HTTP_200_OK)
async def signin(response: Response, professor_data: ProfessorLogin, db: Session = Depends(get_db)):
    auth_service = ProfessorAuthService(db)
    token = auth_service.login_Professor(professor_data)

    response.set_cookie(
        key="access_token",
        value=f"Bearer {token.access_token}",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=24 * 60 * 60
    )
    return token
