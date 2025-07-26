from fastapi import APIRouter, Depends
from app.repository import Subject, Resource, ProfessorRepository
from app.database import get_db
from sqlalchemy.orm import Session
from app.schemas import FetchProfessor
from typing import List

router = APIRouter(
  prefix="",
  tags=["Common router"]
)

@router.get("/subjects")
def getSubject(semester: str, db: Session = Depends(get_db)):
  subject = Subject(db)
  return subject.get_Subject(semester)

@router.get("/resources")
def fetchResource(subjectId: str, db: Session = Depends(get_db)):
  resource = Resource(db)
  return resource.getResource(subjectId=subjectId)

@router.get("/professors", response_model=List[FetchProfessor])
def fetchProfessors(db: Session = Depends(get_db)):
  professor = ProfessorRepository(db)
  return professor.fetchAllProfessor()