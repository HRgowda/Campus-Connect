"""User model for authentication and user management"""

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
import uuid

class Students(Base):
  __tablename__ = "students"
  
  id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, index=True, primary_key=True)
  usn: Mapped[str] = mapped_column(String, unique=True, index=True)
  email: Mapped[str] = mapped_column(String, unique=True)
  password: Mapped[str] = mapped_column(String)
  name: Mapped[str] = mapped_column(String)
  
class Professors(Base):
  __tablename__ = "professors"
  
  id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True, index=True)
  name: Mapped[str] = mapped_column(String)
  email: Mapped[str] = mapped_column(String, unique=True)
  password: Mapped[str] = mapped_column(String)
  