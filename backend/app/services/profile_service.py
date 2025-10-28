from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.repository.profile_repository import ProfileRepository
from app.schemas import (
    StudentProfileCreate, StudentProfileUpdate, StudentProfileResponse,
    StudentUpdate, StudentResponse, ProfessorUpdate, ProfessorResponse,
    WebsiteCreate, WebsiteUpdate, WebsiteResponse,
    ProfileCompletionStatus, ProfileStats
)
from app.models.user import Students, Professors, StudentProfile, Website

class ProfileService:
    def __init__(self, db: Session):
        self.db = db
        self.profile_repo = ProfileRepository(db)

    # Student Profile Operations
    def create_student_profile(self, profile_data: StudentProfileCreate) -> StudentProfileResponse:
        """Create a new student profile"""
        # Check if profile already exists
        existing_profile = self.profile_repo.get_student_profile(profile_data.student_id)
        if existing_profile:
            raise ValueError("Profile already exists for this student")

        # Create the profile
        profile = self.profile_repo.create_student_profile(profile_data)
        return self._format_student_profile_response(profile)

    def get_student_profile(self, student_id: UUID) -> Optional[StudentProfileResponse]:
        """Get student profile by student ID"""
        profile = self.profile_repo.get_student_profile(student_id)
        if not profile:
            return None
        return self._format_student_profile_response(profile)

    def update_student_profile(self, student_id: UUID, profile_data: StudentProfileUpdate) -> Optional[StudentProfileResponse]:
        """Update student profile"""
        profile = self.profile_repo.update_student_profile(student_id, profile_data)
        if not profile:
            return None
        return self._format_student_profile_response(profile)

    def delete_student_profile(self, student_id: UUID) -> bool:
        """Delete student profile"""
        return self.profile_repo.delete_student_profile(student_id)

    # Student Operations
    def get_student(self, student_id: UUID) -> Optional[StudentResponse]:
        """Get student by ID"""
        student = self.profile_repo.get_student(student_id)
        if not student:
            return None
        return self._format_student_response(student)

    def update_student(self, student_id: UUID, student_data: StudentUpdate) -> Optional[StudentResponse]:
        """Update student basic info"""
        update_data = student_data.dict(exclude_unset=True)
        student = self.profile_repo.update_student(student_id, update_data)
        if not student:
            return None
        return self._format_student_response(student)

    # Professor Operations
    def get_professor(self, professor_id: UUID) -> Optional[ProfessorResponse]:
        """Get professor by ID"""
        professor = self.profile_repo.get_professor(professor_id)
        if not professor:
            return None
        return self._format_professor_response(professor)

    def update_professor(self, professor_id: UUID, professor_data: ProfessorUpdate) -> Optional[ProfessorResponse]:
        """Update professor basic info"""
        update_data = professor_data.dict(exclude_unset=True)
        professor = self.profile_repo.update_professor(professor_id, update_data)
        if not professor:
            return None
        return self._format_professor_response(professor)

    # Website Operations
    def add_website(self, student_id: UUID, website_data: WebsiteCreate) -> Optional[WebsiteResponse]:
        """Add a website to student profile"""
        website = self.profile_repo.add_website(student_id, website_data)
        if not website:
            return None
        return self._format_website_response(website)

    def update_website(self, website_id: UUID, website_data: WebsiteUpdate) -> Optional[WebsiteResponse]:
        """Update a website"""
        website = self.profile_repo.update_website(website_id, website_data)
        if not website:
            return None
        return self._format_website_response(website)

    def delete_website(self, website_id: UUID) -> bool:
        """Delete a website"""
        return self.profile_repo.delete_website(website_id)

    def get_websites(self, student_id: UUID) -> List[WebsiteResponse]:
        """Get all websites for a student"""
        websites = self.profile_repo.get_websites(student_id)
        return [self._format_website_response(website) for website in websites]

    # Profile Statistics
    def get_profile_completion_status(self, student_id: UUID) -> ProfileCompletionStatus:
        """Get profile completion status for a student"""
        status_data = self.profile_repo.get_profile_completion_status(student_id)
        return ProfileCompletionStatus(**status_data)

    def get_profile_stats(self) -> ProfileStats:
        """Get overall profile statistics"""
        stats_data = self.profile_repo.get_profile_stats()
        return ProfileStats(**stats_data)

    # Search Operations
    def search_students(self, query: str, limit: int = 20) -> List[StudentResponse]:
        """Search students by name, email, or skills"""
        students = self.profile_repo.search_students(query, limit)
        return [self._format_student_response(student) for student in students]

    def get_students_by_skill(self, skill: str, limit: int = 20) -> List[StudentResponse]:
        """Get students by specific skill"""
        students = self.profile_repo.get_students_by_skill(skill, limit)
        return [self._format_student_response(student) for student in students]

    # Helper Methods
    def _format_student_profile_response(self, profile: StudentProfile) -> StudentProfileResponse:
        """Format student profile for response"""
        return StudentProfileResponse(
            id=profile.id,
            student_id=profile.student_id,
            bio=profile.bio,
            location=profile.location,
            skills=profile.skills or [],
            linkedin=profile.linkedin,
            github=profile.github,
            avatar=profile.avatar,
            created_at=profile.created_at if hasattr(profile, 'created_at') else None,
            updated_at=profile.updated_at if hasattr(profile, 'updated_at') else None,
            websites=[self._format_website_response(website) for website in profile.websites] if profile.websites else []
        )

    def _format_student_response(self, student: Students) -> StudentResponse:
        """Format student for response"""
        return StudentResponse(
            id=student.id,
            name=student.name,
            email=student.email,
            usn=student.usn,
            created_at=student.created_at if hasattr(student, 'created_at') else None,
            profile=self._format_student_profile_response(student.profile) if student.profile else None
        )

    def _format_professor_response(self, professor: Professors) -> ProfessorResponse:
        """Format professor for response"""
        return ProfessorResponse(
            id=professor.id,
            name=professor.name,
            email=professor.email,
            created_at=professor.created_at if hasattr(professor, 'created_at') else None
        )

    def _format_website_response(self, website: Website) -> WebsiteResponse:
        """Format website for response"""
        return WebsiteResponse(
            id=website.id,
            name=website.name,
            url=website.url,
            created_at=website.created_at if hasattr(website, 'created_at') else None
        )

    # Bulk Operations
    def create_or_update_student_profile(self, student_id: UUID, profile_data: StudentProfileUpdate) -> StudentProfileResponse:
        """Create or update student profile"""
        existing_profile = self.profile_repo.get_student_profile(student_id)
        
        if existing_profile:
            # Update existing profile
            updated_profile = self.profile_repo.update_student_profile(student_id, profile_data)
            return self._format_student_profile_response(updated_profile)
        else:
            # Create new profile
            create_data = StudentProfileCreate(
                student_id=student_id,
                **profile_data.dict(exclude_unset=True)
            )
            new_profile = self.profile_repo.create_student_profile(create_data)
            return self._format_student_profile_response(new_profile)

