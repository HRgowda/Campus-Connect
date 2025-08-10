from sqlalchemy import String, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import uuid
import datetime
from typing import List

# Student related database model
class Students(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usn: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)

    ratings = relationship("ProfessorRatings", back_populates="student", cascade="all, delete")
    
    profile : Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="student", cascade="all, delete")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bio: Mapped[str] = mapped_column(String)
    location: Mapped[str] = mapped_column(String)
    skills: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), unique=True)

    websites: Mapped[List["Website"]] = relationship("Website", back_populates="student_profile", cascade="all, delete")
    
    student: Mapped["Students"] = relationship("Students", back_populates="profile")

class Website(Base):
    __tablename__ = "websites"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)

    student_profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id"), nullable=False)

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="websites")

# Professor related database model
class Professors(Base):
    __tablename__ = "professors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)

    ratings = relationship("ProfessorRatings", back_populates="professor", cascade="all, delete")

class ProfessorRatings(Base):
    __tablename__ = "professor_ratings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rating: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))

    professor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professors.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)

    professor = relationship("Professors", back_populates="ratings")
    student = relationship("Students", back_populates="ratings")
