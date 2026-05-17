from fastapi import HTTPException, UploadFile
from config.supabase import supabase
from dotenv import load_dotenv
import os
import uuid
import aiofiles

load_dotenv()

BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")
SUPABASE_URL = os.getenv("SUPABASE_URL")

# Upload file to Supabase Storage
async def upload_media(file: UploadFile, folder: str, user_id: str):
    try:
        # Validate file type
        allowed_image_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        allowed_video_types = ["video/mp4", "video/webm", "video/quicktime"]
        allowed_types = allowed_image_types + allowed_video_types

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only images and videos are allowed"
            )

        # Validate file size (max 50MB)
        max_size = 50 * 1024 * 1024
        contents = await file.read()
        if len(contents) > max_size:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 50MB"
            )

        # Generate unique file name
        extension = file.filename.split(".")[-1]
        unique_filename = f"{folder}/{user_id}/{uuid.uuid4()}.{extension}"

        # Upload to Supabase Storage
        supabase.storage.from_(BUCKET).upload(
            path=unique_filename,
            file=contents,
            file_options={"content-type": file.content_type}
        )

        # Get public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{unique_filename}"

        # Determine media type
        media_type = "image" if file.content_type in allowed_image_types else "video"

        return {
            "message": "File uploaded successfully",
            "url": public_url,
            "media_type": media_type,
            "filename": unique_filename
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Delete file from Supabase Storage
async def delete_media(filename: str):
    try:
        supabase.storage.from_(BUCKET).remove([filename])
        return {"message": "File deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))