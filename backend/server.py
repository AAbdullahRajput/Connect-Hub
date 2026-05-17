from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn
from dotenv import load_dotenv
import os

from routes.authRoutes import router as auth_router
from routes.postRoutes import router as post_router
from routes.likeRoutes import router as like_router
from routes.commentRoutes import router as comment_router
from routes.userRoutes import router as user_router
from routes.followRoutes import router as follow_router
from routes.searchRoutes import router as search_router
from routes.mediaRoutes import router as media_router


load_dotenv()

# Create FastAPI app
app = FastAPI(title="ConnectHub API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.io server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socket_app = socketio.ASGIApp(sio, app)

# Routes
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(post_router, prefix="/api/posts", tags=["Posts"])
app.include_router(like_router, prefix="/api/posts", tags=["Likes"])
app.include_router(comment_router, prefix="/api/posts", tags=["Comments"])
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(follow_router, prefix="/api/users", tags=["Follow"])
app.include_router(search_router, prefix="/api/search", tags=["Search"])
app.include_router(media_router, prefix="/api/media", tags=["Media"])

# Socket.io events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_post(sid, data):
    await sio.enter_room(sid, data["post_id"])

@sio.event
async def leave_post(sid, data):
    await sio.leave_room(sid, data["post_id"])

# Root route
@app.get("/")
async def root():
    return {"message": "ConnectHub API is running 🚀"}

if __name__ == "__main__":
    uvicorn.run(
        "server:socket_app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )