from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, or_
from app.schemas import CreateChannel
from app.models import Channel, ChannelMember
from typing import Optional, List
from uuid import UUID

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
    self.db.flush() # flush to get channel.id without commiting similar to save draft in real example.
    
    member = ChannelMember(
      channel_id = channel.id,
      member_id = data.created_by_id,
      member_role = data.created_by_role,
      is_admin = True
    )
    self.db.add(member)
    
    self.db.commit()
    self.db.refresh(channel)
    return channel
  
  def exist_by_name(self, name: str) -> Optional[Channel]:
    query = select(Channel).where(Channel.name == name)
    return self.db.execute(query).scalar_one_or_none()
  
  def get_public_channel(self, memberId: UUID) -> List[Channel]:
    query = (
      select(Channel)
      .options(joinedload(Channel.members))
      .outerjoin(ChannelMember, Channel.id == ChannelMember.channel_id)
      .where(
        or_(
          Channel.isPrivate == False,
          ChannelMember.member_id == memberId
        )
      )
    )
    return self.db.execute(query).unique().scalars().all()
  