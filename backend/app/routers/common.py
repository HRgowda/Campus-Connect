from fastapi import APIRouter, Depends
from app.repository import Subject
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(
  prefix="",
  tags=["Common router"]
)

@router.get("/subjects")
def getSubject(semester: str, db: Session = Depends(get_db)):
  subject = Subject(db)
  return subject.get_Subject(semester)