from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.services.profile_service import ProfileService
from app.schemas import (
    StudentProfileCreate, StudentProfileUpdate, StudentProfileResponse,
    StudentUpdate, StudentResponse, ProfessorUpdate, ProfessorResponse,
    WebsiteCreate, WebsiteUpdate, WebsiteResponse,
    ProfileCompletionStatus, ProfileStats
)
from app.utils.auth import get_current_user
import shutil
import os
import time
from pathlib import Path

router = APIRouter(
    prefix="/profile",
    tags=["Profile Management"]
)

# File upload directory
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Student Profile Routes
@router.post("/student", response_model=StudentProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_student_profile(
    profile_data: StudentProfileCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new student profile"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create student profiles"
        )
    
    profile_service = ProfileService(db)
    return profile_service.create_student_profile(profile_data)

@router.get("/student/{student_id}", response_model=StudentProfileResponse)
async def get_student_profile(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get student profile by ID"""
    profile_service = ProfileService(db)
    profile = profile_service.get_student_profile(student_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return profile

@router.get("/student", response_model=StudentProfileResponse)
async def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get current user's student profile"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access student profiles"
        )
    
    profile_service = ProfileService(db)
    profile = profile_service.get_student_profile(current_user["user"].id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return profile

@router.put("/student", response_model=StudentProfileResponse)
async def update_student_profile(
    profile_data: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update current user's student profile"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can update student profiles"
        )
    
    profile_service = ProfileService(db)
    profile = profile_service.create_or_update_student_profile(current_user["user"].id, profile_data)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return profile

@router.delete("/student", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete current user's student profile"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can delete student profiles"
        )
    
    profile_service = ProfileService(db)
    success = profile_service.delete_student_profile(current_user["user"].id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

# Student Basic Info Routes
@router.get("/student/info/{student_id}", response_model=StudentResponse)
async def get_student_info(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get student basic information by ID"""
    profile_service = ProfileService(db)
    student = profile_service.get_student(student_id)
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student

@router.put("/student/info", response_model=StudentResponse)
async def update_student_info(
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update current user's basic information"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can update student information"
        )
    
    profile_service = ProfileService(db)
    student = profile_service.update_student(current_user["user"].id, student_data)
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student

# Professor Routes
@router.get("/professor/{professor_id}", response_model=ProfessorResponse)
async def get_professor_info(
    professor_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get professor information by ID"""
    profile_service = ProfileService(db)
    professor = profile_service.get_professor(professor_id)
    
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    
    return professor

@router.put("/professor", response_model=ProfessorResponse)
async def update_professor_info(
    professor_data: ProfessorUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update current user's professor information"""
    if current_user["role"] != "professor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professors can update professor information"
        )
    
    profile_service = ProfileService(db)
    professor = profile_service.update_professor(current_user["user"].id, professor_data)
    
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    
    return professor

# Website Management Routes
@router.post("/student/websites", response_model=WebsiteResponse, status_code=status.HTTP_201_CREATED)
async def add_website(
    website_data: WebsiteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add a website to current user's profile"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can add websites"
        )
    
    profile_service = ProfileService(db)
    website = profile_service.add_website(current_user["user"].id, website_data)
    
    if not website:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return website

@router.put("/student/websites/{website_id}", response_model=WebsiteResponse)
async def update_website(
    website_id: UUID,
    website_data: WebsiteUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a website"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can update websites"
        )
    
    profile_service = ProfileService(db)
    website = profile_service.update_website(website_id, website_data)
    
    if not website:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )
    
    return website

@router.delete("/student/websites/{website_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_website(
    website_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a website"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can delete websites"
        )
    
    profile_service = ProfileService(db)
    success = profile_service.delete_website(website_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website not found"
        )

@router.get("/student/websites", response_model=List[WebsiteResponse])
async def get_websites(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all websites for current user"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access websites"
        )
    
    profile_service = ProfileService(db)
    return profile_service.get_websites(current_user["user"].id)

# Profile Statistics Routes
@router.get("/student/completion", response_model=ProfileCompletionStatus)
async def get_profile_completion(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get profile completion status for current user"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access profile completion status"
        )
    
    profile_service = ProfileService(db)
    return profile_service.get_profile_completion_status(current_user["user"].id)

@router.get("/stats", response_model=ProfileStats)
async def get_profile_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get overall profile statistics (admin only)"""
    # Add admin check if needed
    profile_service = ProfileService(db)
    return profile_service.get_profile_stats()

# Search Routes
@router.get("/students/search", response_model=List[StudentResponse])
async def search_students(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Search students by name, email, or skills"""
    profile_service = ProfileService(db)
    return profile_service.search_students(q, limit)

@router.get("/students/by-skill", response_model=List[StudentResponse])
async def get_students_by_skill(
    skill: str = Query(..., min_length=1, description="Skill to search for"),
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get students by specific skill"""
    profile_service = ProfileService(db)
    return profile_service.get_students_by_skill(skill, limit)

# Avatar Upload Route
@router.post("/student/avatar", response_model=dict)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload avatar for current user"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can upload avatars"
        )
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{current_user['user'].id}_{int(time.time())}.{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update profile with avatar URL
    profile_service = ProfileService(db)
    avatar_url = f"/uploads/avatars/{filename}"
    
    profile_data = StudentProfileUpdate(avatar=avatar_url)
    profile_service.create_or_update_student_profile(current_user["user"].id, profile_data)
    
    return {"avatar_url": avatar_url, "message": "Avatar uploaded successfully"}
