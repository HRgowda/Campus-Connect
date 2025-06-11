from app import database
from app.database import get_db
from app.schemas import CreateStudent, UserResponse, StudentLogin, Token, CreateProfessor, ProfessorLogin
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from app.services.auth_service import StudentAuthService, ProfessorAuthService
import os
from jose import jwt, JWTError
from app.utils import get_current_user

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "200"))

router = APIRouter(
  tags=['User Management'],
)

get_db = database.get_db

@router.post("/student/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def studentSignup(student_data: CreateStudent, db: Session = Depends(get_db)):
  auth_service = StudentAuthService(db)
  return auth_service.register_Student(student_data)

@router.post("/student/signin", response_model=Token, status_code=status.HTTP_200_OK)
async def studentSignin(response: Response, student_data: StudentLogin, db: Session = Depends(get_db)) -> Token:
  auth_service = StudentAuthService(db)
  token = auth_service.student_login(data=student_data)
  
  response.set_cookie(
    key="access_token",
    value=f"Bearer {token.access_token}",
    httponly=True,
    secure=True,
    samesite="lax",
    max_age=24 * 60 * 60
  )
  
  return token

@router.post("/professor/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def professorSignup(professor_data: CreateProfessor, db: Session = Depends(get_db)):
  auth_service = ProfessorAuthService(db)
  return auth_service.register_Professor(professor_data)

@router.post("/professor/signin", response_model=Token, status_code=status.HTTP_200_OK)
async def professorSignin(response: Response, professorData: ProfessorLogin, db: Session = Depends(get_db)) -> Token:
  auth_service = ProfessorAuthService(db)
  token = auth_service.login_Professor(professorData)
  
  response.set_cookie(
    key="access_token",
    value=f"Bearer {token.access_token}",
    httponly=True,
    secure=True,
    samesite="lax",
    max_age=24*60*60
  )
  
  return token

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)) -> UserResponse:
  user = current_user["user"]
  role = current_user["role"]
  
  return UserResponse(
    id = user.id,
    email = getattr(user, "email", None),
    usn = getattr(user, "role", None),
    role = role
  )