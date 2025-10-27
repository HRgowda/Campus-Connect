from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

# Base schemas
class FeedBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    feed_type: str = Field(..., pattern="^(announcement|event|general|academic)$")
    priority: str = Field(default="normal", pattern="^(low|normal|high|urgent)$")
    is_pinned: bool = Field(default=False)
    is_public: bool = Field(default=True)
    tags: List[str] = Field(default_factory=list)
    attachments: List[str] = Field(default_factory=list)

class FeedCreate(FeedBase):
    pass

class FeedUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    feed_type: Optional[str] = Field(None, pattern="^(announcement|event|general|academic)$")
    priority: Optional[str] = Field(None, pattern="^(low|normal|high|urgent)$")
    is_pinned: Optional[bool] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None
    attachments: Optional[List[str]] = None

# Response schemas
class AuthorInfo(BaseModel):
    id: UUID
    name: str
    email: str
    user_type: str  # "student" or "professor"

class FeedResponse(FeedBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    author: AuthorInfo
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    is_liked: bool = False
    is_shared: bool = False

    class Config:
        from_attributes = True

class FeedListResponse(BaseModel):
    feeds: List[FeedResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

# Comment schemas
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    author: AuthorInfo
    feed_id: UUID

    class Config:
        from_attributes = True

# Like/Share schemas
class LikeResponse(BaseModel):
    id: UUID
    created_at: datetime
    author: AuthorInfo

    class Config:
        from_attributes = True

class ShareResponse(BaseModel):
    id: UUID
    created_at: datetime
    author: AuthorInfo

    class Config:
        from_attributes = True

# Filter schemas
class FeedFilter(BaseModel):
    feed_type: Optional[str] = None
    priority: Optional[str] = None
    author_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    search: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_public: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class FeedQueryParams(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=10, ge=1, le=50)
    sort_by: str = Field(default="created_at", pattern="^(created_at|updated_at|title|priority)$")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
    filter: Optional[FeedFilter] = None
