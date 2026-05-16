from fastapi import APIRouter, Depends
from controllers.followController import follow_user, unfollow_user, check_follow
from middleware.auth import verify_token

router = APIRouter()

# POST /api/users/:id/follow - Follow a user (auth required)
@router.post("/{target_user_id}/follow")
async def follow_route(
    target_user_id: str,
    current_user_id: str = Depends(verify_token)
):
    return await follow_user(target_user_id, current_user_id)

# DELETE /api/users/:id/follow - Unfollow a user (auth required)
@router.delete("/{target_user_id}/follow")
async def unfollow_route(
    target_user_id: str,
    current_user_id: str = Depends(verify_token)
):
    return await unfollow_user(target_user_id, current_user_id)

# GET /api/users/:id/follow - Check if following (auth required)
@router.get("/{target_user_id}/follow")
async def check_follow_route(
    target_user_id: str,
    current_user_id: str = Depends(verify_token)
):
    return await check_follow(target_user_id, current_user_id)