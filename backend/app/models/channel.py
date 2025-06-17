"""Channel models for channel-related database operations."""

from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, Enum, UniqueConstraint
from datetime import datetime
import uuid
import enum


class CreatorRoleEnum(str, enum.Enum):
    STUDENT = "student"
    PROFESSOR = "professor"


class Channel(Base):
    __tablename__ = "channels"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    isPrivate: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    created_by_role: Mapped[CreatorRoleEnum] = mapped_column(Enum(CreatorRoleEnum), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # Relationships
    members: Mapped[list["ChannelMember"]] = relationship("ChannelMember", back_populates="channel", cascade="all, delete-orphan")
    
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="channel", cascade="all,delete-orphan")


class ChannelMember(Base):
    __tablename__ = "channel_members"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    channel_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("channels.id"), nullable=False)
    member_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    member_role: Mapped[CreatorRoleEnum] = mapped_column(Enum(CreatorRoleEnum), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    joined_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # Constraints
    __table_args__ = (UniqueConstraint("channel_id", "member_id", name="_channel_member_uc"),)

    # Relationships
    channel: Mapped["Channel"] = relationship("Channel", back_populates="members")


class MessageTypeEnum(str, enum.Enum):
    TEXT = "TEXT"
    IMAGE = "IMAGE"
    FILE = "FILE"
    VIDEO = "VIDEO"


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    content: Mapped[str | None] = mapped_column(String, nullable=True)
    file_url: Mapped[str | None] = mapped_column(String, nullable=True)
    message_type: Mapped[MessageTypeEnum] = mapped_column(Enum(MessageTypeEnum), default=MessageTypeEnum.TEXT)
    channel_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("channels.id"), nullable=False)
    sender_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    sender_role: Mapped[CreatorRoleEnum] = mapped_column(Enum(CreatorRoleEnum), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # Relationships
    channel: Mapped["Channel"] = relationship("Channel", back_populates="messages")
