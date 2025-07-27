from sqlalchemy.orm import Session
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