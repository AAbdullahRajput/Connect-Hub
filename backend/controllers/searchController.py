from fastapi import HTTPException
from config.supabase import supabase

# Search users and posts
async def search_all(query: str, search_type: str = "all"):
    try:
        result = {}

        # Search users
        if search_type in ["all", "users"]:
            users = supabase.table("users").select(
                "id, name, username, profile_picture, bio, followers_count"
            ).or_(
                f"username.ilike.%{query}%,name.ilike.%{query}%"
            ).execute()

            result["users"] = users.data

        # Search posts
        if search_type in ["all", "posts"]:
            posts = supabase.table("posts").select(
                "*, users(id, name, username, profile_picture)"
            ).ilike("content", f"%{query}%").order(
                "engagement_score", desc=True
            ).execute()

            result["posts"] = posts.data

        # Search image posts only
        if search_type == "images":
            posts = supabase.table("posts").select(
                "*, users(id, name, username, profile_picture)"
            ).eq("post_type", "image").ilike(
                "content", f"%{query}%"
            ).order("engagement_score", desc=True).execute()

            result["posts"] = posts.data

        # Search video posts only
        if search_type == "videos":
            posts = supabase.table("posts").select(
                "*, users(id, name, username, profile_picture)"
            ).eq("post_type", "video").ilike(
                "content", f"%{query}%"
            ).order("engagement_score", desc=True).execute()

            result["posts"] = posts.data

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get suggested users (users not followed by current user)
async def get_suggested_users(current_user_id: str):
    try:
        # Get list of users already followed
        following = supabase.table("followers").select(
            "following_id"
        ).eq("follower_id", current_user_id).execute()

        following_ids = [f["following_id"] for f in following.data]
        following_ids.append(current_user_id)  # exclude self

        # Get users not in following list
        all_users = supabase.table("users").select(
            "id, name, username, profile_picture, followers_count"
        ).order("followers_count", desc=True).limit(10).execute()

        suggested = [
            u for u in all_users.data
            if u["id"] not in following_ids
        ]

        return {"suggested_users": suggested[:5]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))