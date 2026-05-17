from pydantic import BaseModel, EmailStr
from typing import Optional

# Register request body
class RegisterModel(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str

# Login request body
class LoginModel(BaseModel):
    email: EmailStr
    password: str

# Update profile request body
class UpdateProfileModel(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    location: Optional[str] = None
    cover_position: Optional[int] = None

# User response (what we send back, no password)
class UserResponse(BaseModel):
    id: str
    name: str
    username: str
    email: str
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    cover_photo: Optional[str] = None
    role: str
    followers_count: int
    following_count: int
    posts_count: int
    created_at: str