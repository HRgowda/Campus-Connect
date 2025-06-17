from sqlalchemy.orm import Session
from app.repository import ChannelRepository
from app.schemas import CreateChannel
from fastapi import HTTPException, status

class ChannelService:
  def __init__(self, db: Session):
    self.channel_repo = ChannelRepository(db)
    
  def create_channel(self, data: CreateChannel) -> CreateChannel:
    if self.channel_repo.exist_by_name(data.name):
      raise HTTPException(
        status_code = status.HTTP_400_BAD_REQUEST,
        detail="Channel already exist"
      )
    
    channel = self.channel_repo.create_channel(data)
    
    return CreateChannel(
      name = channel.name,
      description = channel.description,
      isPrivate = channel.isPrivate,
      created_by_id = channel.created_by_id,
      created_by_role = channel.created_by_role
    )