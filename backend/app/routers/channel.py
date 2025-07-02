from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import CreateChannel
from app.services.channel_service import ChannelService
from app.repository import ChannelRepository
from app.database import get_db
from uuid import UUID

router = APIRouter(
  prefix="/channel",
  tags=["Channel Management"]
)

@router.post("/create", response_model = CreateChannel)
async def create_channel(data: CreateChannel, db: Session = Depends(get_db)):
  channel_service = ChannelService(db)
  return channel_service.create_channel(data)

@router.get("/public_channels")
async def get_public_channel(memberId: UUID, db: Session = Depends(get_db)):
  channel_repository = ChannelRepository(db)
  return channel_repository.get_public_channel(memberId)