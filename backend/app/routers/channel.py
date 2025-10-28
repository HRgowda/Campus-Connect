from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import ChannelCreate
from app.services.channel_service import ChannelService
from app.repository import ChannelRepository
from app.database import get_db
from app.utils.auth import get_current_user
from uuid import UUID

router = APIRouter(
  prefix="/channel",
  tags=["Channel Management"]
)

@router.post("/create")
async def create_channel(data: ChannelCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
  channel_service = ChannelService(db)
  user_id = current_user["user"].id
  user_role = current_user["role"]
  return channel_service.create_channel(data, user_id, user_role)

@router.get("/public_channels")
async def get_public_channel(memberId: UUID, db: Session = Depends(get_db)):
  channel_repository = ChannelRepository(db)
  return channel_repository.get_user_channels(memberId)