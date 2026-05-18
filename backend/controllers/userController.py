from fastapi import HTTPException
from config.supabase import supabase
from models.user import UpdateProfileModel

# Get user profile by username
async def get_profile(username: str):
    try:
        user = supabase.table("users").select(
            "id, name, username, bio, profile_picture, cover_photo, cover_position, website, location, role, followers_count, following_count, posts_count, created_at"
        ).eq("username", username).execute()

        if not user.data:
            raise HTTPException(status_code=404, detail="User not found")

        return {"user": user.data[0]}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Update own profile
async def update_profile(user_id: str, data: UpdateProfileModel):
    try:
        update_data = {k: v for k, v in data.dict().items() if v is not None}

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        if "username" in update_data:
            existing = supabase.table("users").select("id").eq(
                "username", update_data["username"]
            ).execute()
            if existing.data and existing.data[0]["id"] != user_id:
                raise HTTPException(status_code=400, detail="Username already taken")

        updated = supabase.table("users").update(update_data).eq(
            "id", user_id
        ).execute()

        return {"message": "Profile updated successfully", "user": updated.data[0]}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Update profile picture URL
async def update_profile_picture(user_id: str, url: str):
    try:
        updated = supabase.table("users").update(
            {"profile_picture": url}
        ).eq("id", user_id).execute()

        return {"message": "Profile picture updated", "profile_picture": url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Update cover photo URL
async def update_cover_photo(user_id: str, url: str):
    try:
        updated = supabase.table("users").update(
            {"cover_photo": url}
        ).eq("id", user_id).execute()

        return {"message": "Cover photo updated", "cover_photo": url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get followers list
async def get_followers(user_id: str):
    try:
        followers = supabase.table("followers").select(
            "follower_id, users!followers_follower_id_fkey(id, name, username, profile_picture)"
        ).eq("following_id", user_id).execute()

        return {"followers": [f["users"] for f in followers.data]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get following list
async def get_following(user_id: str):
    try:
        following = supabase.table("followers").select(
            "following_id, users!followers_following_id_fkey(id, name, username, profile_picture)"
        ).eq("follower_id", user_id).execute()

        return {"following": [f["users"] for f in following.data]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Search users
async def search_users(query: str):
    try:
        users = supabase.table("users").select(
            "id, name, username, profile_picture, followers_count"
        ).or_(
            f"username.ilike.%{query}%,name.ilike.%{query}%"
        ).execute()

        return {"users": users.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))