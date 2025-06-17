from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import CreateChannel
from app.services.channel_service import ChannelService
from app.database import get_db

router = APIRouter(
  prefix="/channel",
  tags=["Channel Management"]
)

@router.post("/create", response_model = CreateChannel)
async def create_channel(data: CreateChannel, db: Session = Depends(get_db)):
  channel_service = ChannelService(db)
  return channel_service.create_channel(data)