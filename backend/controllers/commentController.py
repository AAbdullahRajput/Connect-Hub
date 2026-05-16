from fastapi import HTTPException
from config.supabase import supabase
from models.post import CreateCommentModel

# Get all comments on a post
async def get_comments(post_id: str):
    try:
        comments = supabase.table("comments").select(
            "*, users(id, name, username, profile_picture)"
        ).eq("post_id", post_id).order("created_at", desc=False).execute()

        return {"comments": comments.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Add comment to a post
async def add_comment(post_id: str, user_id: str, data: CreateCommentModel):
    try:
        # Insert comment
        new_comment = supabase.table("comments").insert({
            "post_id": post_id,
            "user_id": user_id,
            "content": data.content
        }).execute()

        # Update comments count & engagement score
        post = supabase.table("posts").select(
            "likes_count, comments_count"
        ).eq("id", post_id).execute()

        likes_count = post.data[0]["likes_count"]
        comments_count = post.data[0]["comments_count"] + 1
        engagement_score = likes_count + (comments_count * 2)

        supabase.table("posts").update({
            "comments_count": comments_count,
            "engagement_score": engagement_score
        }).eq("id", post_id).execute()

        return {
            "message": "Comment added successfully",
            "comment": new_comment.data[0]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Delete comment
async def delete_comment(comment_id: str, user_id: str):
    try:
        # Check if comment belongs to user
        comment = supabase.table("comments").select(
            "user_id, post_id"
        ).eq("id", comment_id).execute()

        if not comment.data:
            raise HTTPException(status_code=404, detail="Comment not found")

        if comment.data[0]["user_id"] != user_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete this comment"
            )

        post_id = comment.data[0]["post_id"]

        # Delete comment
        supabase.table("comments").delete().eq("id", comment_id).execute()

        # Update comments count & engagement score
        post = supabase.table("posts").select(
            "likes_count, comments_count"
        ).eq("id", post_id).execute()

        likes_count = post.data[0]["likes_count"]
        comments_count = max(0, post.data[0]["comments_count"] - 1)
        engagement_score = likes_count + (comments_count * 2)

        supabase.table("posts").update({
            "comments_count": comments_count,
            "engagement_score": engagement_score
        }).eq("id", post_id).execute()

        return {"message": "Comment deleted successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))