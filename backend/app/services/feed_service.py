from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Tuple
from uuid import UUID
from app.repository import FeedRepository
from app.schemas import (
    FeedCreate, FeedUpdate, FeedResponse, FeedListResponse, 
    CommentCreate, CommentResponse, FeedQueryParams, AuthorInfo
)
from app.models import CampusFeed, FeedComment, Students, Professors

class FeedService:
    def __init__(self, db: Session):
        self.db = db
        self.feed_repo = FeedRepository(db)

    def create_feed(self, feed_data: FeedCreate, author_id: UUID, author_type: str) -> FeedResponse:
        """Create a new feed and return formatted response"""
        feed = self.feed_repo.create_feed(feed_data, author_id, author_type)
        return self._format_feed_response(feed)

    def get_feeds_paginated(
        self, 
        query_params: FeedQueryParams,
        current_user_id: Optional[UUID] = None,
        current_user_type: Optional[str] = None
    ) -> FeedListResponse:
        """Get paginated feeds with filtering"""
        feeds, total = self.feed_repo.get_feeds_paginated(
            query_params, current_user_id, current_user_type
        )
        
        formatted_feeds = []
        for feed in feeds:
            formatted_feed = self._format_feed_response(feed, current_user_id, current_user_type)
            formatted_feeds.append(formatted_feed)

        # Calculate pagination info
        has_next = query_params.page * query_params.per_page < total
        has_prev = query_params.page > 1

        return FeedListResponse(
            feeds=formatted_feeds,
            total=total,
            page=query_params.page,
            per_page=query_params.per_page,
            has_next=has_next,
            has_prev=has_prev
        )

    def get_feed_by_id(
        self, 
        feed_id: UUID, 
        current_user_id: Optional[UUID] = None,
        current_user_type: Optional[str] = None
    ) -> Optional[FeedResponse]:
        """Get a single feed by ID"""
        feed = self.feed_repo.get_feed_by_id(feed_id)
        if not feed:
            return None
        
        return self._format_feed_response(feed, current_user_id, current_user_type)

    def update_feed(self, feed_id: UUID, feed_data: FeedUpdate) -> Optional[FeedResponse]:
        """Update a feed"""
        feed = self.feed_repo.update_feed(feed_id, feed_data)
        if not feed:
            return None
        
        return self._format_feed_response(feed)

    def delete_feed(self, feed_id: UUID) -> bool:
        """Delete a feed"""
        return self.feed_repo.delete_feed(feed_id)

    def like_feed(self, feed_id: UUID, user_id: UUID, user_type: str) -> bool:
        """Like or unlike a feed"""
        return self.feed_repo.like_feed(feed_id, user_id, user_type)

    def comment_feed(self, feed_id: UUID, comment_data: CommentCreate, user_id: UUID, user_type: str) -> CommentResponse:
        """Add a comment to a feed"""
        comment = self.feed_repo.comment_feed(
            feed_id, comment_data.content, user_id, user_type
        )
        return self._format_comment_response(comment)

    def share_feed(self, feed_id: UUID, user_id: UUID, user_type: str) -> bool:
        """Share a feed"""
        self.feed_repo.share_feed(feed_id, user_id, user_type)
        return True

    def get_feed_comments(self, feed_id: UUID) -> List[CommentResponse]:
        """Get all comments for a feed"""
        comments = self.db.query(FeedComment)\
            .options(
                joinedload(FeedComment.student),
                joinedload(FeedComment.professor)
            )\
            .filter(FeedComment.feed_id == feed_id)\
            .order_by(FeedComment.created_at.desc())\
            .all()
        
        return [self._format_comment_response(comment) for comment in comments]

    def _format_feed_response(
        self, 
        feed: CampusFeed, 
        current_user_id: Optional[UUID] = None,
        current_user_type: Optional[str] = None
    ) -> FeedResponse:
        """Format a feed model into a response schema"""
        
        # Get author info
        if feed.author_student:
            author = AuthorInfo(
                id=feed.author_student.id,
                name=feed.author_student.name,
                email=feed.author_student.email,
                user_type="student"
            )
        else:
            author = AuthorInfo(
                id=feed.author_professor.id,
                name=feed.author_professor.name,
                email=feed.author_professor.email,
                user_type="professor"
            )

        # Get stats
        stats = self.feed_repo.get_feed_stats(feed.id)
        
        # Get user interactions
        user_interactions = {}
        if current_user_id and current_user_type:
            user_interactions = self.feed_repo.get_user_feed_interactions(
                feed.id, current_user_id, current_user_type
            )

        return FeedResponse(
            id=feed.id,
            title=feed.title,
            content=feed.content,
            feed_type=feed.feed_type,
            priority=feed.priority,
            is_pinned=feed.is_pinned,
            is_public=feed.is_public,
            tags=feed.tags,
            attachments=feed.attachments,
            created_at=feed.created_at,
            updated_at=feed.updated_at,
            author=author,
            likes_count=stats["likes_count"],
            comments_count=stats["comments_count"],
            shares_count=stats["shares_count"],
            is_liked=user_interactions.get("is_liked", False),
            is_shared=user_interactions.get("is_shared", False)
        )

    def _format_comment_response(self, comment: FeedComment) -> CommentResponse:
        """Format a comment model into a response schema"""
        
        # Get author info
        if comment.student:
            author = AuthorInfo(
                id=comment.student.id,
                name=comment.student.name,
                email=comment.student.email,
                user_type="student"
            )
        else:
            author = AuthorInfo(
                id=comment.professor.id,
                name=comment.professor.name,
                email=comment.professor.email,
                user_type="professor"
            )

        return CommentResponse(
            id=comment.id,
            content=comment.content,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            author=author,
            feed_id=comment.feed_id
        )
