from fastapi import HTTPException
from config.supabase import supabase

# Like a post
async def like_post(post_id: str, user_id: str):
    try:
        # Check if already liked
        existing = supabase.table("likes").select("id").eq(
            "post_id", post_id
        ).eq("user_id", user_id).execute()

        if existing.data:
            raise HTTPException(status_code=400, detail="Post already liked")

        # Insert like
        supabase.table("likes").insert({
            "post_id": post_id,
            "user_id": user_id
        }).execute()

        # Update likes count & engagement score
        post = supabase.table("posts").select(
            "likes_count, comments_count"
        ).eq("id", post_id).execute()

        likes_count = post.data[0]["likes_count"] + 1
        comments_count = post.data[0]["comments_count"]
        engagement_score = likes_count + (comments_count * 2)

        supabase.table("posts").update({
            "likes_count": likes_count,
            "engagement_score": engagement_score
        }).eq("id", post_id).execute()

        return {"message": "Post liked", "likes_count": likes_count}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Unlike a post
async def unlike_post(post_id: str, user_id: str):
    try:
        # Check if like exists
        existing = supabase.table("likes").select("id").eq(
            "post_id", post_id
        ).eq("user_id", user_id).execute()

        if not existing.data:
            raise HTTPException(status_code=400, detail="Post not liked yet")

        # Delete like
        supabase.table("likes").delete().eq(
            "post_id", post_id
        ).eq("user_id", user_id).execute()

        # Update likes count & engagement score
        post = supabase.table("posts").select(
            "likes_count, comments_count"
        ).eq("id", post_id).execute()

        likes_count = max(0, post.data[0]["likes_count"] - 1)
        comments_count = post.data[0]["comments_count"]
        engagement_score = likes_count + (comments_count * 2)

        supabase.table("posts").update({
            "likes_count": likes_count,
            "engagement_score": engagement_score
        }).eq("id", post_id).execute()

        return {"message": "Post unliked", "likes_count": likes_count}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get who liked a post
async def get_post_likes(post_id: str):
    try:
        likes = supabase.table("likes").select(
            "*, users(id, name, username, profile_picture)"
        ).eq("post_id", post_id).execute()

        return {"likes": likes.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))