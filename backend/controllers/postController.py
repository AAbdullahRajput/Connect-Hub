from fastapi import HTTPException
from config.supabase import supabase
from models.post import CreatePostModel

# Create new post
async def create_post(data: CreatePostModel, user_id: str):
    try:
        # Calculate engagement score
        engagement_score = 0

        new_post = supabase.table("posts").insert({
            "user_id": user_id,
            "content": data.content,
            "image_url": data.image_url,
            "video_url": data.video_url,
            "post_type": data.post_type,
            "engagement_score": engagement_score
        }).execute()

        # Update user posts count
        user = supabase.table("users").select("posts_count").eq("id", user_id).execute()
        current_count = user.data[0]["posts_count"]
        supabase.table("users").update({"posts_count": current_count + 1}).eq("id", user_id).execute()

        return {"message": "Post created successfully", "post": new_post.data[0]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get all posts (explore - sorted by engagement)
async def get_all_posts():
    try:
        posts = supabase.table("posts").select(
            "*, users(id, name, username, profile_picture)"
        ).order("engagement_score", desc=True).execute()

        return {"posts": posts.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get feed posts (from followed users)
async def get_feed_posts(user_id: str):
    try:
        # Get list of users that current user follows
        following = supabase.table("followers").select(
            "following_id"
        ).eq("follower_id", user_id).execute()

        following_ids = [f["following_id"] for f in following.data]
        following_ids.append(user_id)  # include own posts

        # Get posts from followed users
        posts = supabase.table("posts").select(
            "*, users(id, name, username, profile_picture)"
        ).in_("user_id", following_ids).order("created_at", desc=True).execute()

        return {"posts": posts.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get single post
async def get_single_post(post_id: str):
    try:
        post = supabase.table("posts").select(
            "*, users(id, name, username, profile_picture)"
        ).eq("id", post_id).execute()

        if not post.data:
            raise HTTPException(status_code=404, detail="Post not found")

        return {"post": post.data[0]}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Delete post
async def delete_post(post_id: str, user_id: str):
    try:
        # Check if post belongs to user
        post = supabase.table("posts").select("user_id").eq("id", post_id).execute()

        if not post.data:
            raise HTTPException(status_code=404, detail="Post not found")

        if post.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")

        supabase.table("posts").delete().eq("id", post_id).execute()

        # Update user posts count
        user = supabase.table("users").select("posts_count").eq("id", user_id).execute()
        current_count = user.data[0]["posts_count"]
        supabase.table("users").update(
            {"posts_count": max(0, current_count - 1)}
        ).eq("id", user_id).execute()

        return {"message": "Post deleted successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))