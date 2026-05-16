from fastapi import HTTPException
from config.supabase import supabase
from models.user import RegisterModel, LoginModel
from middleware.auth import create_access_token
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Register new user
async def register(data: RegisterModel):
    try:
        # Check if email already exists
        existing_email = supabase.table("users").select("id").eq("email", data.email).execute()
        if existing_email.data:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Check if username already exists
        existing_username = supabase.table("users").select("id").eq("username", data.username).execute()
        if existing_username.data:
            raise HTTPException(status_code=400, detail="Username already taken")

        # Hash password
        hashed_password = pwd_context.hash(data.password)

        # Insert new user
        new_user = supabase.table("users").insert({
            "name": data.name,
            "username": data.username,
            "email": data.email,
            "password": hashed_password,
            "role": "user"
        }).execute()

        user = new_user.data[0]

        # Create token
        token = create_access_token({"user_id": user["id"]})

        return {
            "message": "Registration successful",
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"]
            }
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Login user
async def login(data: LoginModel):
    try:
        # Find user by email
        result = supabase.table("users").select("*").eq("email", data.email).execute()
        if not result.data:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        user = result.data[0]

        # Verify password
        if not pwd_context.verify(data.password, user["password"]):
            raise HTTPException(status_code=400, detail="Invalid email or password")

        # Create token
        token = create_access_token({"user_id": user["id"]})

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"]
            }
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))