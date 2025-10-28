from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, BackgroundTasks, WebSocket
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.services.channel_service import ChannelService
from app.websocket.channel_websocket import websocket_endpoint
from app.schemas import (
    ChannelCreate, ChannelUpdate, ChannelResponse, ChannelListResponse,
    ChannelMemberCreate, ChannelMemberUpdate, ChannelMemberResponse,
    MessageCreate, MessageUpdate, MessageResponse, MessageListResponse,
    MessageReactionCreate, MessageReactionResponse,
    PinnedMessageResponse, ChannelInviteCreate, ChannelInviteResponse,
    ChannelInviteJoin, FileUploadResponse, ChannelSearchParams,
    MessageQueryParams, ChannelStats, ChannelNotification,
    ChannelTypeEnum, ChannelRoleEnum, MessageTypeEnum, CreatorRoleEnum
)
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/channels",
    tags=["Channel Management"]
)

# Channel Operations
@router.post("/", response_model=ChannelResponse, status_code=status.HTTP_201_CREATED)
async def create_channel(
    channel_data: ChannelCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new channel"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    user_role = CreatorRoleEnum(current_user["role"])
    
    try:
        return channel_service.create_channel(channel_data, user_id, user_role)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=ChannelListResponse)
async def get_user_channels(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all public channels (simplified)"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    return channel_service.get_all_public_channels(user_id, page, per_page)

@router.get("/search", response_model=ChannelListResponse)
async def search_channels(
    query: Optional[str] = Query(None, min_length=1, max_length=100),
    channel_type: Optional[ChannelTypeEnum] = None,
    is_private: Optional[bool] = None,
    tags: Optional[List[str]] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Search channels"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    params = ChannelSearchParams(
        query=query,
        channel_type=channel_type,
        is_private=is_private,
        tags=tags,
        page=page,
        per_page=per_page
    )
    
    return channel_service.search_channels(params, user_id)

@router.get("/{channel_id}", response_model=ChannelResponse)
async def get_channel(
    channel_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get channel by ID"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    channel = channel_service.get_channel(channel_id, user_id)
    if not channel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")
    
    return channel

@router.put("/{channel_id}", response_model=ChannelResponse)
async def update_channel(
    channel_id: UUID,
    channel_data: ChannelUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update channel"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        channel = channel_service.update_channel(channel_id, channel_data, user_id)
        if not channel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")
        return channel
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_channel(
    channel_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete channel"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        success = channel_service.delete_channel(channel_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

# Channel Member Operations
@router.post("/{channel_id}/members", response_model=ChannelMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_member(
    channel_id: UUID,
    member_data: ChannelMemberCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add member to channel"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        member = channel_service.add_member(channel_id, member_data, user_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to add member")
        return member
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.get("/{channel_id}/members", response_model=List[ChannelMemberResponse])
async def get_channel_members(
    channel_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get channel members"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        return channel_service.get_channel_members(channel_id, user_id)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.put("/{channel_id}/members/{member_id}", response_model=ChannelMemberResponse)
async def update_member(
    channel_id: UUID,
    member_id: UUID,
    member_data: ChannelMemberUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update channel member"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        member = channel_service.update_member(channel_id, member_id, member_data, user_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
        return member
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.delete("/{channel_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    channel_id: UUID,
    member_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Remove member from channel"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        success = channel_service.remove_member(channel_id, member_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.post("/{channel_id}/join", response_model=ChannelMemberResponse, status_code=status.HTTP_201_CREATED)
async def join_channel(
    channel_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Join a channel"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    user_role = CreatorRoleEnum(current_user["role"])
    
    try:
        member = channel_service.join_channel(channel_id, user_id, user_role)
        if not member:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to join channel")
        return member
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.post("/{channel_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_channel(
    channel_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Leave a channel"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        success = channel_service.leave_channel(channel_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not a member of this channel")
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

# Message Operations
@router.post("/{channel_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    channel_id: UUID,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new message"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    user_role = CreatorRoleEnum(current_user["role"])
    
    try:
        message = channel_service.create_message(message_data, channel_id, user_id, user_role)
        if not message:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create message")
        return message
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.get("/{channel_id}/messages", response_model=MessageListResponse)
async def get_messages(
    channel_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    before: Optional[datetime] = None,
    after: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get channel messages"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    params = MessageQueryParams(
        page=page,
        per_page=per_page,
        before=before,
        after=after
    )
    
    try:
        return channel_service.get_messages(channel_id, params, user_id)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.put("/{channel_id}/messages/{message_id}", response_model=MessageResponse)
async def update_message(
    channel_id: UUID,
    message_id: UUID,
    message_data: MessageUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update message"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    message = channel_service.update_message(message_id, message_data, user_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    
    return message

@router.delete("/{channel_id}/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    channel_id: UUID,
    message_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete message"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    success = channel_service.delete_message(message_id, user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

# Message Reactions
@router.post("/{channel_id}/messages/{message_id}/reactions", response_model=MessageReactionResponse, status_code=status.HTTP_201_CREATED)
async def add_reaction(
    channel_id: UUID,
    message_id: UUID,
    reaction_data: MessageReactionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add reaction to message"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    user_role = CreatorRoleEnum(current_user["role"])
    
    reaction = channel_service.add_reaction(message_id, user_id, user_role, reaction_data)
    if not reaction:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to add reaction")
    
    return reaction

@router.delete("/{channel_id}/messages/{message_id}/reactions/{emoji}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_reaction(
    channel_id: UUID,
    message_id: UUID,
    emoji: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Remove reaction from message"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    success = channel_service.remove_reaction(message_id, user_id, emoji)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reaction not found")

@router.get("/{channel_id}/messages/{message_id}/reactions", response_model=List[MessageReactionResponse])
async def get_message_reactions(
    channel_id: UUID,
    message_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get message reactions"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    # Check if user is member
    if not channel_service.channel_repo.is_member(channel_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a member of this channel")
    
    return channel_service.get_message_reactions(message_id)

# Pinned Messages
@router.post("/{channel_id}/messages/{message_id}/pin", response_model=PinnedMessageResponse, status_code=status.HTTP_201_CREATED)
async def pin_message(
    channel_id: UUID,
    message_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Pin a message"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    user_role = CreatorRoleEnum(current_user["role"])
    
    try:
        pinned = channel_service.pin_message(channel_id, message_id, user_id, user_role)
        if not pinned:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to pin message")
        return pinned
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.delete("/{channel_id}/messages/{message_id}/pin", status_code=status.HTTP_204_NO_CONTENT)
async def unpin_message(
    channel_id: UUID,
    message_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Unpin a message"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        success = channel_service.unpin_message(channel_id, message_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not pinned")
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.get("/{channel_id}/pinned", response_model=List[PinnedMessageResponse])
async def get_pinned_messages(
    channel_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get pinned messages"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        return channel_service.get_pinned_messages(channel_id, user_id)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.post("/{channel_id}/join", response_model=ChannelMemberResponse)
async def join_channel(
    channel_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join channel directly"""
    service = ChannelService(db)
    user_id = current_user["user"].id
    user_role = current_user["role"]
    return service.join_channel(channel_id, user_id, user_role)

@router.post("/{channel_id}/join-request", response_model=ChannelInviteResponse)
async def create_join_request(
    channel_id: UUID,
    message: str = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create join request for a channel"""
    service = ChannelService(db)
    user_id = current_user["user"].id
    return service.create_join_request(channel_id, user_id, message)

@router.post("/invites/{invite_id}/action")
async def handle_invite_action(
    invite_id: UUID,
    action: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle invite actions (approve, reject, accept, decline)"""
    service = ChannelService(db)
    user_id = current_user["user"].id
    return service.handle_invite_action(invite_id, action, user_id)

@router.get("/invites/my", response_model=List[ChannelInviteResponse])
async def get_my_invites(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invites for current user"""
    service = ChannelService(db)
    user_id = current_user["user"].id
    return service.get_user_invites(user_id)

@router.get("/{channel_id}/invites", response_model=List[ChannelInviteResponse])
async def get_channel_invites(
    channel_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get channel invites (admin only)"""
    service = ChannelService(db)
    user_id = current_user["user"].id
    return service.get_channel_invites(channel_id, user_id)

# File Upload
@router.post("/{channel_id}/upload", response_model=FileUploadResponse)
async def upload_file(
    channel_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload file for channel"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        return channel_service.upload_file(file, channel_id, user_id)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

# Channel Statistics
@router.get("/{channel_id}/stats", response_model=ChannelStats)
async def get_channel_stats(
    channel_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get channel statistics"""
    channel_service = ChannelService(db)
    user_id = current_user["user"].id
    
    try:
        return channel_service.get_channel_stats(channel_id, user_id)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

# WebSocket endpoint for real-time messaging
@router.websocket("/ws")
async def websocket_route(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time messaging"""
    await websocket_endpoint(websocket, token, db)
