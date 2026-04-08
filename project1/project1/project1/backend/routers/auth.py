from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import Database

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Request models
class UserCreate(BaseModel):
    email: str
    password: str
    user_type: str = "job_seeker"
    full_name: Optional[str] = None
    phone: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Initialize database
db = Database()

@router.post("/register", response_model=dict)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Create user in database
        user = await db.create_user(user_data.dict())
        return {"message": "User registered successfully", "user_id": user["id"]}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return access token"""
    try:
        # Get user by email
        user = await db.get_user_by_email(form_data.username)  # username is email in this case
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        stored_user = await db.get_user_by_email(form_data.username, include_password=True)
        if not db.verify_password(form_data.password, stored_user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=1440)  # 24 hours
        access_token = db.create_access_token(
            data={"sub": user["email"], "user_id": user["id"]},
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add this function to the Database class in db.py
# async def get_user_by_email(self, email: str, include_password: bool = False) -> Optional[Dict[str, Any]]:
#     """Retrieve a user by email, optionally including password hash"""
#     try:
#         result = self.supabase.table('users').select('*').eq('email', email).execute()
#         if not result.data:
#             return None
#             
#         user = result.data[0]
#         if not include_password:
#             user.pop('password_hash', None)
#         return user
#     except Exception as e:
#         print(f"Error getting user: {str(e)}")
#         return None
