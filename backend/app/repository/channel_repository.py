from sqlalchemy.orm import Session
from sqlalchemy import select
from app.schemas import CreateChannel
from app.models import Channel
from typing import Optional

class ChannelRepository:
  """Handles channel related database operations"""
  
  def __init__(self, db: Session):
    self.db = db
    
  def create_channel(self, data: CreateChannel) -> Channel:
    channel = Channel(
      name = data.name,
      description = data.description,
      isPrivate = data.is_Private,
      created_by_id = data.created_by_id,
      created_by_role = data.created_by_role
    )
    
    self.db.add(channel)
    self.db.commit()
    self.db.refresh(channel)
    return channel
  
  def exist_by_name(self, name: str) -> Optional[Channel]:
    query = select(Channel).where(Channel.name == name)
    return self.db.execute(query).scalar_one_or_none()
  