from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from typing import List, Optional, Tuple
from uuid import UUID
from app.models.user import Students, Professors, StudentProfile, Website
from app.schemas import StudentProfileCreate, StudentProfileUpdate, WebsiteCreate, WebsiteUpdate

class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    # Student Profile Operations
    def create_student_profile(self, profile_data: StudentProfileCreate) -> StudentProfile:
        """Create a new student profile"""
        db_profile = StudentProfile(
            student_id=profile_data.student_id,
            bio=profile_data.bio,
            location=profile_data.location,
            skills=profile_data.skills or [],
            linkedin=profile_data.linkedin,
            github=profile_data.github,
            avatar=profile_data.avatar
        )
        self.db.add(db_profile)
        self.db.commit()
        self.db.refresh(db_profile)
        return db_profile

    def get_student_profile(self, student_id: UUID) -> Optional[StudentProfile]:
        """Get student profile by student ID"""
        return self.db.query(StudentProfile).options(
            joinedload(StudentProfile.websites)
        ).filter(StudentProfile.student_id == student_id).first()

    def update_student_profile(self, student_id: UUID, profile_data: StudentProfileUpdate) -> Optional[StudentProfile]:
        """Update student profile"""
        db_profile = self.get_student_profile(student_id)
        if not db_profile:
            return None

        update_data = profile_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_profile, field, value)

        self.db.commit()
        self.db.refresh(db_profile)
        return db_profile

    def delete_student_profile(self, student_id: UUID) -> bool:
        """Delete student profile"""
        db_profile = self.get_student_profile(student_id)
        if not db_profile:
            return False

        self.db.delete(db_profile)
        self.db.commit()
        return True

    # Website Operations
    def add_website(self, student_id: UUID, website_data: WebsiteCreate) -> Optional[Website]:
        """Add a website to student profile"""
        profile = self.get_student_profile(student_id)
        if not profile:
            return None

        db_website = Website(
            name=website_data.name,
            url=website_data.url,
            student_profile_id=profile.id
        )
        self.db.add(db_website)
        self.db.commit()
        self.db.refresh(db_website)
        return db_website

    def update_website(self, website_id: UUID, website_data: WebsiteUpdate) -> Optional[Website]:
        """Update a website"""
        db_website = self.db.query(Website).filter(Website.id == website_id).first()
        if not db_website:
            return None

        update_data = website_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_website, field, value)

        self.db.commit()
        self.db.refresh(db_website)
        return db_website

    def delete_website(self, website_id: UUID) -> bool:
        """Delete a website"""
        db_website = self.db.query(Website).filter(Website.id == website_id).first()
        if not db_website:
            return False

        self.db.delete(db_website)
        self.db.commit()
        return True

    def get_websites(self, student_id: UUID) -> List[Website]:
        """Get all websites for a student"""
        profile = self.get_student_profile(student_id)
        if not profile:
            return []
        return profile.websites

    # Student Operations
    def get_student(self, student_id: UUID) -> Optional[Students]:
        """Get student by ID"""
        return self.db.query(Students).options(
            joinedload(Students.profile).joinedload(StudentProfile.websites)
        ).filter(Students.id == student_id).first()

    def update_student(self, student_id: UUID, update_data: dict) -> Optional[Students]:
        """Update student basic info"""
        db_student = self.db.query(Students).filter(Students.id == student_id).first()
        if not db_student:
            return None

        for field, value in update_data.items():
            if hasattr(db_student, field):
                setattr(db_student, field, value)

        self.db.commit()
        self.db.refresh(db_student)
        return db_student

    # Professor Operations
    def get_professor(self, professor_id: UUID) -> Optional[Professors]:
        """Get professor by ID"""
        return self.db.query(Professors).filter(Professors.id == professor_id).first()

    def update_professor(self, professor_id: UUID, update_data: dict) -> Optional[Professors]:
        """Update professor basic info"""
        db_professor = self.db.query(Professors).filter(Professors.id == professor_id).first()
        if not db_professor:
            return None

        for field, value in update_data.items():
            if hasattr(db_professor, field):
                setattr(db_professor, field, value)

        self.db.commit()
        self.db.refresh(db_professor)
        return db_professor

    # Profile Statistics
    def get_profile_completion_status(self, student_id: UUID) -> dict:
        """Get profile completion status for a student"""
        profile = self.get_student_profile(student_id)
        if not profile:
            return {
                "is_complete": False,
                "completion_percentage": 0,
                "missing_fields": ["bio", "location", "skills", "linkedin", "github", "avatar"],
                "total_fields": 6
            }

        fields = {
            "bio": bool(profile.bio),
            "location": bool(profile.location),
            "skills": bool(profile.skills and len(profile.skills) > 0),
            "linkedin": bool(profile.linkedin),
            "github": bool(profile.github),
            "avatar": bool(profile.avatar)
        }

        completed_fields = sum(fields.values())
        missing_fields = [field for field, completed in fields.items() if not completed]

        return {
            "is_complete": completed_fields == 6,
            "completion_percentage": int((completed_fields / 6) * 100),
            "missing_fields": missing_fields,
            "total_fields": 6
        }

    def get_profile_stats(self) -> dict:
        """Get overall profile statistics"""
        total_students = self.db.query(Students).count()
        total_professors = self.db.query(Professors).count()
        
        # Count profiles with at least bio, location, and skills
        completed_profiles = self.db.query(StudentProfile).filter(
            and_(
                StudentProfile.bio.isnot(None),
                StudentProfile.bio != "",
                StudentProfile.location.isnot(None),
                StudentProfile.location != "",
                func.array_length(StudentProfile.skills, 1) > 0
            )
        ).count()

        completion_rate = (completed_profiles / total_students * 100) if total_students > 0 else 0

        return {
            "total_students": total_students,
            "total_professors": total_professors,
            "profiles_completed": completed_profiles,
            "completion_rate": round(completion_rate, 2)
        }

    # Search and Filter
    def search_students(self, query: str, limit: int = 20) -> List[Students]:
        """Search students by name, email, or skills"""
        search_filter = or_(
            Students.name.ilike(f"%{query}%"),
            Students.email.ilike(f"%{query}%"),
            func.array_to_string(StudentProfile.skills, ',').ilike(f"%{query}%")
        )

        return self.db.query(Students).join(StudentProfile, isouter=True).filter(
            search_filter
        ).options(
            joinedload(Students.profile).joinedload(StudentProfile.websites)
        ).limit(limit).all()

    def get_students_by_skill(self, skill: str, limit: int = 20) -> List[Students]:
        """Get students by specific skill"""
        return self.db.query(Students).join(StudentProfile).filter(
            func.array_to_string(StudentProfile.skills, ',').ilike(f"%{skill}%")
        ).options(
            joinedload(Students.profile).joinedload(StudentProfile.websites)
        ).limit(limit).all()
