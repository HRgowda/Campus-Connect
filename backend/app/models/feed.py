from sqlalchemy import String, ForeignKey, DateTime, Integer, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import uuid
import datetime
from typing import List, Optional

class CampusFeed(Base):
    """Main campus feed posts model"""
    __tablename__ = "campus_feeds"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    feed_type: Mapped[str] = mapped_column(String(50), nullable=False)  # announcement, event, general, academic
    priority: Mapped[str] = mapped_column(String(20), default="normal")  # low, normal, high, urgent
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    attachments: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)  # file URLs
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(datetime.timezone.utc), onupdate=datetime.datetime.now(datetime.timezone.utc))
    
    # Foreign keys
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=True)
    professor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professors.id"), nullable=True)
    
    # Relationships
    author_student: Mapped[Optional["Students"]] = relationship("Students", foreign_keys=[author_id])
    author_professor: Mapped[Optional["Professors"]] = relationship("Professors", foreign_keys=[professor_id])
    likes: Mapped[List["FeedLike"]] = relationship("FeedLike", back_populates="feed", cascade="all, delete")
    comments: Mapped[List["FeedComment"]] = relationship("FeedComment", back_populates="feed", cascade="all, delete")
    shares: Mapped[List["FeedShare"]] = relationship("FeedShare", back_populates="feed", cascade="all, delete")

class FeedLike(Base):
    """Feed likes model"""
    __tablename__ = "feed_likes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    
    # Foreign keys
    feed_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campus_feeds.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=True)
    professor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professors.id"), nullable=True)
    
    # Relationships
    feed: Mapped["CampusFeed"] = relationship("CampusFeed", back_populates="likes")
    student: Mapped[Optional["Students"]] = relationship("Students")
    professor: Mapped[Optional["Professors"]] = relationship("Professors")

class FeedComment(Base):
    """Feed comments model"""
    __tablename__ = "feed_comments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(datetime.timezone.utc), onupdate=datetime.datetime.now(datetime.timezone.utc))
    
    # Foreign keys
    feed_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campus_feeds.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=True)
    professor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professors.id"), nullable=True)
    
    # Relationships
    feed: Mapped["CampusFeed"] = relationship("CampusFeed", back_populates="comments")
    student: Mapped[Optional["Students"]] = relationship("Students")
    professor: Mapped[Optional["Professors"]] = relationship("Professors")

class FeedShare(Base):
    """Feed shares model"""
    __tablename__ = "feed_shares"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    
    # Foreign keys
    feed_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campus_feeds.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=True)
    professor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("professors.id"), nullable=True)
    
    # Relationships
    feed: Mapped["CampusFeed"] = relationship("CampusFeed", back_populates="shares")
    student: Mapped[Optional["Students"]] = relationship("Students")
    professor: Mapped[Optional["Professors"]] = relationship("Professors")
