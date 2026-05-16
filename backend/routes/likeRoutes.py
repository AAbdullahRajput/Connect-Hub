from fastapi import APIRouter, Depends
from controllers.likeController import like_post, unlike_post, get_post_likes
from middleware.auth import verify_token

router = APIRouter()

# POST /api/posts/:id/like - Like a post (auth required)
@router.post("/{post_id}/like")
async def like_post_route(post_id: str, user_id: str = Depends(verify_token)):
    return await like_post(post_id, user_id)

# DELETE /api/posts/:id/like - Unlike a post (auth required)
@router.delete("/{post_id}/like")
async def unlike_post_route(post_id: str, user_id: str = Depends(verify_token)):
    return await unlike_post(post_id, user_id)

# GET /api/posts/:id/likes - Get who liked a post
@router.get("/{post_id}/likes")
async def get_likes_route(post_id: str):
    return await get_post_likes(post_id)