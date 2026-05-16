from fastapi import HTTPException
from config.supabase import supabase

# Follow a user
async def follow_user(target_user_id: str, current_user_id: str):
    try:
        # Can't follow yourself
        if target_user_id == current_user_id:
            raise HTTPException(status_code=400, detail="You cannot follow yourself")

        # Check if already following
        existing = supabase.table("followers").select("id").eq(
            "follower_id", current_user_id
        ).eq("following_id", target_user_id).execute()

        if existing.data:
            raise HTTPException(status_code=400, detail="Already following this user")

        # Insert follow record
        supabase.table("followers").insert({
            "follower_id": current_user_id,
            "following_id": target_user_id
        }).execute()

        # Update following_count for current user
        current = supabase.table("users").select(
            "following_count"
        ).eq("id", current_user_id).execute()

        supabase.table("users").update({
            "following_count": current.data[0]["following_count"] + 1
        }).eq("id", current_user_id).execute()

        # Update followers_count for target user
        target = supabase.table("users").select(
            "followers_count"
        ).eq("id", target_user_id).execute()

        supabase.table("users").update({
            "followers_count": target.data[0]["followers_count"] + 1
        }).eq("id", target_user_id).execute()

        return {"message": "User followed successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Unfollow a user
async def unfollow_user(target_user_id: str, current_user_id: str):
    try:
        # Check if actually following
        existing = supabase.table("followers").select("id").eq(
            "follower_id", current_user_id
        ).eq("following_id", target_user_id).execute()

        if not existing.data:
            raise HTTPException(status_code=400, detail="You are not following this user")

        # Delete follow record
        supabase.table("followers").delete().eq(
            "follower_id", current_user_id
        ).eq("following_id", target_user_id).execute()

        # Update following_count for current user
        current = supabase.table("users").select(
            "following_count"
        ).eq("id", current_user_id).execute()

        supabase.table("users").update({
            "following_count": max(0, current.data[0]["following_count"] - 1)
        }).eq("id", current_user_id).execute()

        # Update followers_count for target user
        target = supabase.table("users").select(
            "followers_count"
        ).eq("id", target_user_id).execute()

        supabase.table("users").update({
            "followers_count": max(0, target.data[0]["followers_count"] - 1)
        }).eq("id", target_user_id).execute()

        return {"message": "User unfollowed successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Check if current user follows target user
async def check_follow(target_user_id: str, current_user_id: str):
    try:
        existing = supabase.table("followers").select("id").eq(
            "follower_id", current_user_id
        ).eq("following_id", target_user_id).execute()

        return {"is_following": bool(existing.data)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))