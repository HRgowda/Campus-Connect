from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Tuple
from uuid import UUID
from datetime import datetime
from app.models import CampusFeed, FeedLike, FeedComment, FeedShare, Students, Professors
from app.schemas import FeedCreate, FeedUpdate, FeedFilter, FeedQueryParams

class FeedRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_feed(self, feed_data: FeedCreate, author_id: UUID, author_type: str) -> CampusFeed:
        """Create a new campus feed post"""
        feed_dict = feed_data.dict()
        
        if author_type == "student":
            feed_dict["author_id"] = author_id
            feed_dict["professor_id"] = None
        else:
            feed_dict["professor_id"] = author_id
            feed_dict["author_id"] = None
            
        feed = CampusFeed(**feed_dict)
        self.db.add(feed)
        self.db.commit()
        self.db.refresh(feed)
        return feed

    def get_feed_by_id(self, feed_id: UUID) -> Optional[CampusFeed]:
        """Get a single feed by ID with all relationships"""
        return self.db.query(CampusFeed)\
            .options(
                joinedload(CampusFeed.author_student),
                joinedload(CampusFeed.author_professor),
                joinedload(CampusFeed.likes),
                joinedload(CampusFeed.comments),
                joinedload(CampusFeed.shares)
            )\
            .filter(CampusFeed.id == feed_id)\
            .first()

    def get_feeds_paginated(
        self, 
        query_params: FeedQueryParams,
        current_user_id: Optional[UUID] = None,
        current_user_type: Optional[str] = None
    ) -> Tuple[List[CampusFeed], int]:
        """Get paginated feeds with filtering and sorting"""
        
        # Base query
        query = self.db.query(CampusFeed)\
            .options(
                joinedload(CampusFeed.author_student),
                joinedload(CampusFeed.author_professor),
                joinedload(CampusFeed.likes),
                joinedload(CampusFeed.comments),
                joinedload(CampusFeed.shares)
            )

        # Apply filters
        if query_params.filter:
            filters = []
            
            if query_params.filter.feed_type:
                filters.append(CampusFeed.feed_type == query_params.filter.feed_type)
            
            if query_params.filter.priority:
                filters.append(CampusFeed.priority == query_params.filter.priority)
            
            if query_params.filter.author_id:
                filters.append(
                    or_(
                        CampusFeed.author_id == query_params.filter.author_id,
                        CampusFeed.professor_id == query_params.filter.author_id
                    )
                )
            
            if query_params.filter.tags:
                filters.append(CampusFeed.tags.contains(query_params.filter.tags))
            
            if query_params.filter.search:
                search_term = f"%{query_params.filter.search}%"
                filters.append(
                    or_(
                        CampusFeed.title.ilike(search_term),
                        CampusFeed.content.ilike(search_term)
                    )
                )
            
            if query_params.filter.is_pinned is not None:
                filters.append(CampusFeed.is_pinned == query_params.filter.is_pinned)
            
            if query_params.filter.is_public is not None:
                filters.append(CampusFeed.is_public == query_params.filter.is_public)
            
            if query_params.filter.date_from:
                filters.append(CampusFeed.created_at >= query_params.filter.date_from)
            
            if query_params.filter.date_to:
                filters.append(CampusFeed.created_at <= query_params.filter.date_to)
            
            if filters:
                query = query.filter(and_(*filters))

        # Apply sorting
        sort_column = getattr(CampusFeed, query_params.sort_by)
        if query_params.sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Always prioritize pinned posts
        query = query.order_by(desc(CampusFeed.is_pinned))

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (query_params.page - 1) * query_params.per_page
        feeds = query.offset(offset).limit(query_params.per_page).all()

        return feeds, total

    def update_feed(self, feed_id: UUID, feed_data: FeedUpdate) -> Optional[CampusFeed]:
        """Update an existing feed"""
        feed = self.db.query(CampusFeed).filter(CampusFeed.id == feed_id).first()
        if not feed:
            return None
        
        update_data = feed_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(feed, field, value)
        
        feed.updated_at = datetime.now(datetime.timezone.utc)
        self.db.commit()
        self.db.refresh(feed)
        return feed

    def delete_feed(self, feed_id: UUID) -> bool:
        """Delete a feed"""
        feed = self.db.query(CampusFeed).filter(CampusFeed.id == feed_id).first()
        if not feed:
            return False
        
        self.db.delete(feed)
        self.db.commit()
        return True

    def like_feed(self, feed_id: UUID, user_id: UUID, user_type: str) -> bool:
        """Like or unlike a feed"""
        # Check if already liked
        existing_like = self.db.query(FeedLike).filter(
            and_(
                FeedLike.feed_id == feed_id,
                or_(
                    and_(FeedLike.student_id == user_id, user_type == "student"),
                    and_(FeedLike.professor_id == user_id, user_type == "professor")
                )
            )
        ).first()

        if existing_like:
            # Unlike
            self.db.delete(existing_like)
            self.db.commit()
            return False
        else:
            # Like
            like_data = {"feed_id": feed_id}
            if user_type == "student":
                like_data["student_id"] = user_id
                like_data["professor_id"] = None
            else:
                like_data["professor_id"] = user_id
                like_data["student_id"] = None
            
            like = FeedLike(**like_data)
            self.db.add(like)
            self.db.commit()
            return True

    def comment_feed(self, feed_id: UUID, content: str, user_id: UUID, user_type: str) -> FeedComment:
        """Add a comment to a feed"""
        comment_data = {
            "feed_id": feed_id,
            "content": content
        }
        
        if user_type == "student":
            comment_data["student_id"] = user_id
            comment_data["professor_id"] = None
        else:
            comment_data["professor_id"] = user_id
            comment_data["student_id"] = None
        
        comment = FeedComment(**comment_data)
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def share_feed(self, feed_id: UUID, user_id: UUID, user_type: str) -> FeedShare:
        """Share a feed"""
        share_data = {"feed_id": feed_id}
        
        if user_type == "student":
            share_data["student_id"] = user_id
            share_data["professor_id"] = None
        else:
            share_data["professor_id"] = user_id
            share_data["student_id"] = None
        
        share = FeedShare(**share_data)
        self.db.add(share)
        self.db.commit()
        self.db.refresh(share)
        return share

    def get_feed_stats(self, feed_id: UUID) -> dict:
        """Get feed statistics"""
        likes_count = self.db.query(FeedLike).filter(FeedLike.feed_id == feed_id).count()
        comments_count = self.db.query(FeedComment).filter(FeedComment.feed_id == feed_id).count()
        shares_count = self.db.query(FeedShare).filter(FeedShare.feed_id == feed_id).count()
        
        return {
            "likes_count": likes_count,
            "comments_count": comments_count,
            "shares_count": shares_count
        }

    def get_user_feed_interactions(self, feed_id: UUID, user_id: UUID, user_type: str) -> dict:
        """Get user's interactions with a specific feed"""
        is_liked = self.db.query(FeedLike).filter(
            and_(
                FeedLike.feed_id == feed_id,
                or_(
                    and_(FeedLike.student_id == user_id, user_type == "student"),
                    and_(FeedLike.professor_id == user_id, user_type == "professor")
                )
            )
        ).first() is not None

        is_shared = self.db.query(FeedShare).filter(
            and_(
                FeedShare.feed_id == feed_id,
                or_(
                    and_(FeedShare.student_id == user_id, user_type == "student"),
                    and_(FeedShare.professor_id == user_id, user_type == "professor")
                )
            )
        ).first() is not None

        return {
            "is_liked": is_liked,
            "is_shared": is_shared
        }
