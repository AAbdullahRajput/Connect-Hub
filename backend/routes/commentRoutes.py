from fastapi import APIRouter, Depends
from controllers.commentController import get_comments, add_comment, delete_comment
from models.post import CreateCommentModel
from middleware.auth import verify_token

router = APIRouter()

# GET /api/posts/:id/comments - Get all comments
@router.get("/{post_id}/comments")
async def get_comments_route(post_id: str):
    return await get_comments(post_id)

# POST /api/posts/:id/comments - Add comment (auth required)
@router.post("/{post_id}/comments")
async def add_comment_route(
    post_id: str,
    data: CreateCommentModel,
    user_id: str = Depends(verify_token)
):
    return await add_comment(post_id, user_id, data)

# DELETE /api/comments/:id - Delete comment (auth required)
@router.delete("/comments/{comment_id}")
async def delete_comment_route(comment_id: str, user_id: str = Depends(verify_token)):
    return await delete_comment(comment_id, user_id)