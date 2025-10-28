from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Students, Professors
from app.utils.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(
    prefix="/users",
    tags=["User Management"]
)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str = None
    usn: str = None
    role: str
    department: str = None
    year: int = None
    avatar_url: str = None

    class Config:
        from_attributes = True

@router.get("/all")
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all users (students and professors) for channel invitations"""
    try:
        # Get all students
        students = db.query(Students).all()
        student_users = [
            UserResponse(
                id=str(student.id),
                name=student.name,
                usn=student.usn,
                role="student",
                department=student.department,
                year=student.year,
                avatar_url=getattr(student, 'avatar_url', None)
            )
            for student in students
        ]

        # Get all professors
        professors = db.query(Professors).all()
        professor_users = [
            UserResponse(
                id=str(professor.id),
                name=professor.name,
                email=professor.email,
                role="professor",
                department=professor.department,
                avatar_url=getattr(professor, 'avatar_url', None)
            )
            for professor in professors
        ]

        # Combine and return all users
        all_users = student_users + professor_users
        
        return all_users

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")
