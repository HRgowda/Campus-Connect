from app.repository import Subject, Resource
from sqlalchemy.orm import Session
from app.schemas import AddSubject, UploadResource
from fastapi import HTTPException, status
import os
import uuid 
from fastapi import UploadFile

BASE_UPLOAD_DIR = "uploads/resources"
BASE_URL = "http://localhost:8000"

class ResourceService:
  
  def __init__(self, db: Session):
    self.subject_repository = Subject(db)
    self.resource_repository = Resource(db)
    
  def AddSubject(self, data: AddSubject):
    
    if self.subject_repository.subject_exists_by_name_or_code(data.subjectName, data.subjectCode):
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Subject already exist"
      )
    
    return self.subject_repository.addSubject(data)
  
  def save_uploaded_file(self, file: UploadFile) -> tuple[str, str]:
    # check if the directory to store the files is present or not
    if not os.path.exists(BASE_UPLOAD_DIR):
      os.makedirs(BASE_UPLOAD_DIR)
      
    # Get file extension
    extension = file.filename.split(".")[-1]
    
    # generate unique filename
    unique_filename = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(BASE_UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as f:
      f.write(file.file.read())
      
    return f"{BASE_URL}/resources/{unique_filename}", extension
    
  def upload_and_create_resource(self, file: UploadFile, data: UploadResource):
    
    file_url, extension = self.save_uploaded_file(file)
    
    resource_data = {
      "resourceName": data.resourceName,
      "resourceType": extension,
      "resourceUrl": file_url,
      "subjectId": data.subjectId
    }
    
    return self.resource_repository.create_resource(resource_data)
    
