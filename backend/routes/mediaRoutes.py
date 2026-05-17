from fastapi import APIRouter, UploadFile, File, Depends, Query
from controllers.mediaController import upload_media, delete_media
from middleware.auth import verify_token

router = APIRouter()

# POST /api/media/upload - Upload image or video (auth required)
@router.post("/upload")
async def upload_media_route(
    file: UploadFile = File(...),
    folder: str = Query(default="posts"),
    user_id: str = Depends(verify_token)
):
    return await upload_media(file, folder, user_id)

# DELETE /api/media/delete - Delete file from storage (auth required)
@router.delete("/delete")
async def delete_media_route(
    filename: str,
    user_id: str = Depends(verify_token)
):
    return await delete_media(filename)