from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

# Enums
class ChannelTypeEnum(str, Enum):
    GENERAL = "general"
    ACADEMIC = "academic"
    PROJECT = "project"
    ANNOUNCEMENT = "announcement"
    STUDY_GROUP = "study_group"
    CLUB = "club"
    DEPARTMENT = "department"

class ChannelRoleEnum(str, Enum):
    MEMBER = "member"
    MODERATOR = "moderator"
    ADMIN = "admin"
    OWNER = "owner"

class MessageTypeEnum(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    LINK = "link"
    SYSTEM = "system"

class CreatorRoleEnum(str, Enum):
    STUDENT = "student"
    PROFESSOR = "professor"

# Channel Schemas
class ChannelBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, pattern="^[a-zA-Z0-9_-]+$")
    description: Optional[str] = Field(None, max_length=1000)
    channel_type: ChannelTypeEnum = Field(default=ChannelTypeEnum.GENERAL)
    is_private: bool = Field(default=False)
    max_members: Optional[int] = Field(None, ge=2, le=1000)
    tags: List[str] = Field(default_factory=list, max_items=10)

class ChannelCreate(ChannelBase):
    pass

class ChannelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, pattern="^[a-zA-Z0-9_-]+$")
    description: Optional[str] = Field(None, max_length=1000)
    channel_type: Optional[ChannelTypeEnum] = None
    is_private: Optional[bool] = None
    max_members: Optional[int] = Field(None, ge=2, le=1000)
    tags: Optional[List[str]] = Field(None, max_items=10)
    is_archived: Optional[bool] = None

class ChannelResponse(ChannelBase):
    id: UUID
    avatar_url: Optional[str]
    is_archived: bool
    created_by_id: UUID
    created_by_role: CreatorRoleEnum
    created_at: datetime
    updated_at: datetime
    member_count: int
    is_member: bool
    user_role: Optional[ChannelRoleEnum]

    class Config:
        from_attributes = True

# Channel Member Schemas
class ChannelMemberBase(BaseModel):
    member_id: UUID
    member_role: CreatorRoleEnum
    channel_role: ChannelRoleEnum = Field(default=ChannelRoleEnum.MEMBER)

class ChannelMemberCreate(ChannelMemberBase):
    pass

class ChannelMemberUpdate(BaseModel):
    channel_role: Optional[ChannelRoleEnum] = None
    is_muted: Optional[bool] = None
    is_banned: Optional[bool] = None

class ChannelMemberResponse(ChannelMemberBase):
    id: UUID
    channel_id: UUID
    is_muted: bool
    is_banned: bool
    joined_at: datetime
    last_read_at: Optional[datetime]

    class Config:
        from_attributes = True

# Message Schemas
class MessageBase(BaseModel):
    content: Optional[str] = Field(None, max_length=4000)
    message_type: MessageTypeEnum = Field(default=MessageTypeEnum.TEXT)
    reply_to_id: Optional[UUID] = None

class MessageCreate(MessageBase):
    pass

class MessageUpdate(BaseModel):
    content: Optional[str] = Field(None, max_length=4000)

class MessageResponse(MessageBase):
    id: UUID
    file_url: Optional[str]
    file_name: Optional[str]
    file_size: Optional[int]
    is_edited: bool
    edited_at: Optional[datetime]
    channel_id: UUID
    sender_id: UUID
    sender_name: Optional[str] = None
    sender_role: CreatorRoleEnum
    created_at: datetime
    updated_at: datetime
    reactions: List[Dict[str, Any]] = Field(default_factory=list)
    reply_to: Optional["MessageResponse"] = None

    class Config:
        from_attributes = True

# Message Reaction Schemas
class MessageReactionCreate(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=10)

class MessageReactionResponse(BaseModel):
    id: UUID
    message_id: UUID
    user_id: UUID
    user_role: CreatorRoleEnum
    emoji: str
    created_at: datetime

    class Config:
        from_attributes = True

# Pinned Message Schemas
class PinnedMessageResponse(BaseModel):
    id: UUID
    channel_id: UUID
    message_id: UUID
    pinned_by_id: UUID
    pinned_by_role: CreatorRoleEnum
    pinned_at: datetime
    message: MessageResponse

    class Config:
        from_attributes = True

# Channel Invite Schemas
class ChannelInviteCreate(BaseModel):
    channel_id: UUID
    invited_user_id: UUID
    invite_type: str = "invitation"  # invitation, join_request
    message: Optional[str] = None
    expires_at: Optional[datetime] = None

class ChannelInviteResponse(BaseModel):
    id: UUID
    channel_id: UUID
    invited_by_id: UUID
    invited_user_id: UUID
    status: str
    invite_type: str
    message: Optional[str]
    expires_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChannelInviteJoin(BaseModel):
    channel_id: UUID
    message: Optional[str] = None

class ChannelInviteAction(BaseModel):
    invite_id: UUID
    action: str  # approve, reject, accept, decline

# File Upload Schemas
class FileUploadResponse(BaseModel):
    file_url: str
    file_name: str
    file_size: int
    message_type: MessageTypeEnum

# Channel List and Search Schemas
class ChannelListResponse(BaseModel):
    channels: List[ChannelResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

class ChannelSearchParams(BaseModel):
    query: Optional[str] = Field(None, min_length=1, max_length=100)
    channel_type: Optional[ChannelTypeEnum] = None
    is_private: Optional[bool] = None
    tags: Optional[List[str]] = Field(None, max_items=5)
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)

# Message List Schemas
class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

class MessageQueryParams(BaseModel):
    page: int = Field(1, ge=1)
    per_page: int = Field(50, ge=1, le=100)
    before: Optional[datetime] = None
    after: Optional[datetime] = None

# WebSocket Event Schemas
class WebSocketEvent(BaseModel):
    type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)

class MessageEvent(BaseModel):
    type: str = "message"
    message: MessageResponse
    channel_id: UUID

class TypingEvent(BaseModel):
    type: str = "typing"
    user_id: UUID
    user_name: str
    channel_id: UUID
    is_typing: bool

class UserPresenceEvent(BaseModel):
    type: str = "presence"
    user_id: UUID
    user_name: str
    channel_id: UUID
    is_online: bool
    last_seen: datetime

# Channel Statistics
class ChannelStats(BaseModel):
    total_messages: int
    total_members: int
    active_members: int
    messages_today: int
    messages_this_week: int
    most_active_hour: int
    top_contributors: List[Dict[str, Any]]

# Notification Schemas
class ChannelNotification(BaseModel):
    id: UUID
    channel_id: UUID
    channel_name: str
    message_id: Optional[UUID]
    sender_id: UUID
    sender_name: str
    notification_type: str
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True