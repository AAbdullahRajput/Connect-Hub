from fastapi import APIRouter, Depends
from controllers.userController import (
    get_profile,
    update_profile,
    update_profile_picture,
    update_cover_photo,
    get_followers,
    get_following,
    search_users
)
from models.user import UpdateProfileModel
from middleware.auth import verify_token

router = APIRouter()

# GET /api/users/search?q= - Search users
@router.get("/search")
async def search_users_route(q: str):
    return await search_users(q)

# GET /api/users/:username - Get profile by username
@router.get("/{username}")
async def get_profile_route(username: str):
    return await get_profile(username)

# PUT /api/users/profile - Update own profile (auth required)
@router.put("/profile")
async def update_profile_route(
    data: UpdateProfileModel,
    user_id: str = Depends(verify_token)
):
    return await update_profile(user_id, data)

# POST /api/users/profile/picture - Update profile picture (auth required)
@router.post("/profile/picture")
async def update_picture_route(
    url: str,
    user_id: str = Depends(verify_token)
):
    return await update_profile_picture(user_id, url)

# POST /api/users/profile/cover - Update cover photo (auth required)
@router.post("/profile/cover")
async def update_cover_route(
    url: str,
    user_id: str = Depends(verify_token)
):
    return await update_cover_photo(user_id, url)

# GET /api/users/:id/followers - Get followers list
@router.get("/{user_id}/followers")
async def get_followers_route(user_id: str):
    return await get_followers(user_id)

# GET /api/users/:id/following - Get following list
@router.get("/{user_id}/following")
async def get_following_route(user_id: str):
    return await get_following(user_id)