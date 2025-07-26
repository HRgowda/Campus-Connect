"""User model for authentication and user management"""

from sqlalchemy import Integer, String, ForeignKey, DateTime
import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import uuid

class Students(Base):
  __tablename__ = "students"
  
  id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, index=True, primary_key=True)
  usn: Mapped[str] = mapped_column(String, unique=True, index=True)
  email: Mapped[str] = mapped_column(String, unique=True)
  password: Mapped[str] = mapped_column(String)
  name: Mapped[str] = mapped_column(String)
  
  ratings = relationship("ProfessorRatings", back_populates="student", cascade="all, delete")
  
class Professors(Base):
  __tablename__ = "professors"
  
  id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True, index=True)
  name: Mapped[str] = mapped_column(String)
  email: Mapped[str] = mapped_column(String, unique=True)
  password: Mapped[str] = mapped_column(String)
  
  ratings = relationship("ProfessorRatings", back_populates="professor", cascade="all, delete")
  
class ProfessorRatings(Base):
  __tablename__ = "professorRatings"
  
  id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
  rating: Mapped[int] = mapped_column(Integer)
  created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
  
  professor_id: Mapped[uuid.uuid4] = mapped_column(ForeignKey("professors.id"), nullable=False)
  student_id: Mapped[uuid.uuid4] = mapped_column(ForeignKey("students.id"), nullable=False)
  
  professor = relationship("Professors", back_populates="ratings")
  student = relationship("Students", back_populates="ratings")