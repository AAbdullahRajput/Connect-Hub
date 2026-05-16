from fastapi import APIRouter
from controllers.authController import register, login
from models.user import RegisterModel, LoginModel

router = APIRouter()

# POST /api/auth/register
@router.post("/register")
async def register_route(data: RegisterModel):
    return await register(data)

# POST /api/auth/login
@router.post("/login")
async def login_route(data: LoginModel):
    return await login(data)