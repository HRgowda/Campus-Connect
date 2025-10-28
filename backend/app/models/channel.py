"""Channel models for channel-related database operations."""

from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, Enum, UniqueConstraint, Text, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from datetime import datetime, timezone
import uuid
import enum
from typing import List, Optional


class CreatorRoleEnum(str, enum.Enum):
    STUDENT = "student"
    PROFESSOR = "professor"


class ChannelTypeEnum(str, enum.Enum):
    GENERAL = "general"
    ACADEMIC = "academic"
    PROJECT = "project"
    ANNOUNCEMENT = "announcement"
    STUDY_GROUP = "study_group"
    CLUB = "club"
    DEPARTMENT = "department"


class Channel(Base):
    __tablename__ = "channels"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    channel_type: Mapped[ChannelTypeEnum] = mapped_column(Enum(ChannelTypeEnum), default=ChannelTypeEnum.GENERAL)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    max_members: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    created_by_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    created_by_role: Mapped[CreatorRoleEnum] = mapped_column(Enum(CreatorRoleEnum), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    members: Mapped[List["ChannelMember"]] = relationship("ChannelMember", back_populates="channel", cascade="all, delete-orphan")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="channel", cascade="all, delete-orphan")
    pinned_messages: Mapped[List["PinnedMessage"]] = relationship("PinnedMessage", back_populates="channel", cascade="all, delete-orphan")
    invites: Mapped[List["ChannelInvite"]] = relationship("ChannelInvite", back_populates="channel", cascade="all, delete-orphan")


class ChannelRoleEnum(str, enum.Enum):
    MEMBER = "member"
    MODERATOR = "moderator"
    ADMIN = "admin"
    OWNER = "owner"


class ChannelMember(Base):
    __tablename__ = "channel_members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    member_role: Mapped[CreatorRoleEnum] = mapped_column(Enum(CreatorRoleEnum), nullable=False)
    channel_role: Mapped[ChannelRoleEnum] = mapped_column(Enum(ChannelRoleEnum), default=ChannelRoleEnum.MEMBER)
    is_muted: Mapped[bool] = mapped_column(Boolean, default=False)
    is_banned: Mapped[bool] = mapped_column(Boolean, default=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Constraints
    __table_args__ = (UniqueConstraint("channel_id", "member_id", name="_channel_member_uc"),)

    # Relationships
    channel: Mapped["Channel"] = relationship("Channel", back_populates="members")


class MessageTypeEnum(str, enum.Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    LINK = "link"
    SYSTEM = "system"


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    message_type: Mapped[MessageTypeEnum] = mapped_column(Enum(MessageTypeEnum), default=MessageTypeEnum.TEXT)
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False)
    edited_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    reply_to_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("messages.id"), nullable=True)
    
    channel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False)
    sender_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    sender_role: Mapped[CreatorRoleEnum] = mapped_column(Enum(CreatorRoleEnum), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    channel: Mapped["Channel"] = relationship("Channel", back_populates="messages")
    reply_to: Mapped[Optional["Message"]] = relationship("Message", remote_side=[id])
    reactions: Mapped[List["MessageReaction"]] = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")
    pinned_in: Mapped[List["PinnedMessage"]] = relationship("PinnedMessage", back_populates="message", cascade="all, delete-orphan")


class MessageReaction(Base):
    __tablename__ = "message_reactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    user_role: Mapped[CreatorRoleEnum] = mapped_column(Enum(CreatorRoleEnum), nullable=False)
    emoji: Mapped[str] = mapped_column(String(10), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Constraints
    __table_args__ = (UniqueConstraint("message_id", "user_id", "emoji", name="_message_reaction_uc"),)

    # Relationships
    message: Mapped["Message"] = relationship("Message", back_populates="reactions")


class PinnedMessage(Base):
    __tablename__ = "pinned_messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False)
    message_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    pinned_by_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    pinned_by_role: Mapped[CreatorRoleEnum] = mapped_column(Enum(CreatorRoleEnum), nullable=False)
    pinned_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Constraints
    __table_args__ = (UniqueConstraint("channel_id", "message_id", name="_pinned_message_uc"),)

    # Relationships
    channel: Mapped["Channel"] = relationship("Channel", back_populates="pinned_messages")
    message: Mapped["Message"] = relationship("Message", back_populates="pinned_in")


class ChannelInvite(Base):
    __tablename__ = "channel_invites"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    channel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False)
    invited_by_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    invited_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, accepted, declined, expired, approved, rejected
    invite_type: Mapped[str] = mapped_column(String(20), default="invitation")  # invitation, join_request
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    channel: Mapped["Channel"] = relationship("Channel", back_populates="invites")