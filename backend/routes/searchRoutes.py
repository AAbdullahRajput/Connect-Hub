from fastapi import APIRouter, Depends
from controllers.searchController import search_all, get_suggested_users
from middleware.auth import verify_token

router = APIRouter()

# GET /api/search?q=&type= - Search users and posts
@router.get("")
async def search_route(q: str, type: str = "all"):
    return await search_all(q, type)

# GET /api/search/suggested - Get suggested users (auth required)
@router.get("/suggested")
async def suggested_users_route(current_user_id: str = Depends(verify_token)):
    return await get_suggested_users(current_user_id)