from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from app.database import get_db
from app.services.feed_service import FeedService
from app.schemas import (
    FeedCreate, FeedUpdate, FeedResponse, FeedListResponse, 
    CommentCreate, CommentResponse, FeedQueryParams, FeedFilter
)
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/feeds",
    tags=["Campus Feed Management"]
)

@router.post("/", response_model=FeedResponse, status_code=status.HTTP_201_CREATED)
async def create_feed(
    feed_data: FeedCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new campus feed post"""
    feed_service = FeedService(db)
    
    user_id = current_user["user"].id
    user_type = current_user["role"]
    
    return feed_service.create_feed(feed_data, user_id, user_type)

@router.get("/", response_model=FeedListResponse)
async def get_feeds(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    sort_by: str = Query(default="created_at", pattern="^(created_at|updated_at|title|priority)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    feed_type: Optional[str] = Query(default=None, pattern="^(announcement|event|general|academic)$"),
    priority: Optional[str] = Query(default=None, pattern="^(low|normal|high|urgent)$"),
    author_id: Optional[UUID] = Query(default=None),
    tags: Optional[List[str]] = Query(default=None),
    search: Optional[str] = Query(default=None),
    is_pinned: Optional[bool] = Query(default=None),
    is_public: Optional[bool] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get paginated campus feeds with filtering and sorting"""
    feed_service = FeedService(db)
    
    # Build filter
    feed_filter = FeedFilter(
        feed_type=feed_type,
        priority=priority,
        author_id=author_id,
        tags=tags,
        search=search,
        is_pinned=is_pinned,
        is_public=is_public
    )
    
    query_params = FeedQueryParams(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        filter=feed_filter
    )
    
    user_id = current_user["user"].id
    user_type = current_user["role"]
    
    return feed_service.get_feeds_paginated(query_params, user_id, user_type)

@router.get("/{feed_id}", response_model=FeedResponse)
async def get_feed(
    feed_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a single feed by ID"""
    feed_service = FeedService(db)
    
    user_id = current_user["user"].id
    user_type = current_user["role"]
    
    feed = feed_service.get_feed_by_id(feed_id, user_id, user_type)
    if not feed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feed not found"
        )
    
    return feed

@router.put("/{feed_id}", response_model=FeedResponse)
async def update_feed(
    feed_id: UUID,
    feed_data: FeedUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a feed (only by author)"""
    feed_service = FeedService(db)
    
    # First check if feed exists and user is the author
    feed = feed_service.get_feed_by_id(feed_id)
    if not feed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feed not found"
        )
    
    user_id = current_user["user"].id
    user_type = current_user["role"]
    
    # Check if user is the author
    if feed.author.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own posts"
        )
    
    updated_feed = feed_service.update_feed(feed_id, feed_data)
    if not updated_feed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feed not found"
        )
    
    return updated_feed

@router.delete("/{feed_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feed(
    feed_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a feed (only by author)"""
    feed_service = FeedService(db)
    
    # First check if feed exists and user is the author
    feed = feed_service.get_feed_by_id(feed_id)
    if not feed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feed not found"
        )
    
    user_id = current_user["user"].id
    user_type = current_user["role"]
    
    # Check if user is the author
    if feed.author.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own posts"
        )
    
    success = feed_service.delete_feed(feed_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feed not found"
        )

@router.post("/{feed_id}/like")
async def like_feed(
    feed_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Like or unlike a feed"""
    feed_service = FeedService(db)
    
    user_id = current_user["user"].id
    user_type = current_user["role"]
    
    is_liked = feed_service.like_feed(feed_id, user_id, user_type)
    
    return {
        "message": "Feed liked" if is_liked else "Feed unliked",
        "is_liked": is_liked
    }

@router.post("/{feed_id}/comment", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def comment_feed(
    feed_id: UUID,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add a comment to a feed"""
    feed_service = FeedService(db)
    
    # Verify feed exists
    feed = feed_service.get_feed_by_id(feed_id)
    if not feed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feed not found"
        )
    
    user_id = current_user["user"].id
    user_type = current_user["role"]
    
    return feed_service.comment_feed(feed_id, comment_data, user_id, user_type)

@router.get("/{feed_id}/comments", response_model=List[CommentResponse])
async def get_feed_comments(
    feed_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all comments for a feed"""
    feed_service = FeedService(db)
    
    # Verify feed exists
    feed = feed_service.get_feed_by_id(feed_id)
    if not feed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feed not found"
        )
    
    return feed_service.get_feed_comments(feed_id)

@router.post("/{feed_id}/share")
async def share_feed(
    feed_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Share a feed"""
    feed_service = FeedService(db)
    
    # Verify feed exists
    feed = feed_service.get_feed_by_id(feed_id)
    if not feed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feed not found"
        )
    
    user_id = current_user["user"].id
    user_type = current_user["role"]
    
    feed_service.share_feed(feed_id, user_id, user_type)
    
    return {
        "message": "Feed shared successfully"
    }
