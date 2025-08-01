from sqlalchemy.orm import Session
from sqlalchemy import select
from app.schemas import ProfessorRatingSchema
from app.models import ProfessorRatings
from typing import List

class Feedback:
  
  def __init__(self, db: Session):
    self.db = db
    
  def addFeedback(self, data: ProfessorRatingSchema) -> List[ProfessorRatings]:
    
    feedback = ProfessorRatings(
      rating = data.rating,
      professor_id = data.professorId,
      student_id = data.studentId
    )
    
    self.db.add(feedback)
    self.db.commit()
    self.db.refresh(feedback)
    return feedback
  
  def getFeedback(self, professorId: str) -> List[ProfessorRatings]:
    query = select(ProfessorRatings).where(ProfessorRatings.professor_id == professorId)
    return self.db.execute(query).scalars().all()