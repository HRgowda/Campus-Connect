"""Resource model for academic resource management"""

from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
import uuid

# One-to-many relationship: one subject can have multiple resources

class Subjects(Base):
  __tablename__ = "subject"
  
  id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
  subjectName: Mapped[str] = mapped_column(String, unique=True, index=True)
  subjectCode: Mapped[str] = mapped_column(String, unique=True)
  semester: Mapped[str] = mapped_column(String) 
  
  resources: Mapped[list["Resources"]] = relationship("Resources", back_populates="subject")
  
class Resources(Base):
  __tablename__ = "resource"
  
  id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
  resourceName: Mapped[str] = mapped_column(String)
  resourceType: Mapped[str] = mapped_column(String, default="pdf")
  resourceUrl: Mapped[str] = mapped_column(String)
  subjectId: Mapped[uuid.UUID] = mapped_column(ForeignKey("subject.id"))
  
  subject: Mapped["Subjects"] = relationship("Subjects", back_populates="resources")
  