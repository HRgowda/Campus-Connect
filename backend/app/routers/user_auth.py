from app import database
from app.database import get_db
from app.schemas import CreateStudent, UserResponse, StudentLogin, Token
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.services.auth_service import StudentAuthService

router = APIRouter(
  tags=['User (Student, Professor)'],
  prefix="/user"
)

get_db = database.get_db

@router.post("/student/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def studentSignup(student_data: CreateStudent, db: Session = Depends(get_db)):
  auth_service = StudentAuthService(db)
  return auth_service.register_Student(student_data)

@router.post("/student/signin", response_model=Token, status_code=status.HTTP_200_OK)
async def studentSignin(student_data: StudentLogin, db: Session = Depends(get_db)) -> Token:
  auth_service = StudentAuthService(db)
  return auth_service.student_login(data=student_data)