from app import database
from app.database import get_db
from app.schemas import CreateStudent, UserResponse
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.services.auth_service import AuthService

router = APIRouter(
  tags=['User (Student, Professor)'],
  prefix="/user"
)

get_db = database.get_db

@router.post("/student/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def studentSignup(student_data: CreateStudent, db: Session = Depends(get_db)):
  auth_service = AuthService(db)
  return auth_service.register_Student(student_data)

