from pydantic import BaseModel
from typing import Optional

# Create post request body
class CreatePostModel(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    post_type: str  # 'text', 'image', 'video', 'mixed'

# Post response
class PostResponse(BaseModel):
    id: str
    user_id: str
    content: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    post_type: str
    likes_count: int
    comments_count: int
    engagement_score: int
    created_at: str

# Comment request body
class CreateCommentModel(BaseModel):
    content: str

# Comment response
class CommentResponse(BaseModel):
    id: str
    post_id: str
    user_id: str
    content: str
    created_at: str