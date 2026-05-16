from fastapi import APIRouter, Depends
from controllers.postController import (
    create_post,
    get_all_posts,
    get_feed_posts,
    get_single_post,
    delete_post
)
from models.post import CreatePostModel
from middleware.auth import verify_token

router = APIRouter()

# GET /api/posts - All posts (explore)
@router.get("")
async def all_posts_route():
    return await get_all_posts()

# GET /api/posts/feed - Feed posts (auth required)
@router.get("/feed")
async def feed_posts_route(user_id: str = Depends(verify_token)):
    return await get_feed_posts(user_id)

# GET /api/posts/:id - Single post
@router.get("/{post_id}")
async def single_post_route(post_id: str):
    return await get_single_post(post_id)

# POST /api/posts - Create post (auth required)
@router.post("")
async def create_post_route(
    data: CreatePostModel,
    user_id: str = Depends(verify_token)
):
    return await create_post(data, user_id)

# DELETE /api/posts/:id - Delete post (auth required)
@router.delete("/{post_id}")
async def delete_post_route(
    post_id: str,
    user_id: str = Depends(verify_token)
):
    return await delete_post(post_id, user_id)