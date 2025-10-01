from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import List
from ..models import (
    UserCreate, UserLogin, UserResponse, UserUpdate, 
    AuthResponse, MessageResponse
)
from ..auth import (
    get_password_hash, verify_password, create_access_token, 
    get_current_user_id
)
import os
from pathlib import Path

# Get database from server.py
from ..server import db

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user"""
    user_id = get_current_user_id(credentials.credentials)
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.post("/register", response_model=AuthResponse)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": hashed_password,
        "avatar": f"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        "watchlist": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    # Create access token
    access_token = create_access_token(data={"sub": str(result.inserted_id)})
    
    # Return user response
    user_response = UserResponse(
        id=str(result.inserted_id),
        name=user_data.name,
        email=user_data.email,
        avatar=user_doc["avatar"],
        watchlist=[],
        created_at=user_doc["created_at"]
    )
    
    return AuthResponse(
        access_token=access_token,
        user=user_response
    )

@router.post("/login", response_model=AuthResponse)
async def login_user(login_data: UserLogin):
    """Login user"""
    # Find user by email
    user = await db.users.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    # Return user response
    user_response = UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        avatar=user.get("avatar"),
        watchlist=user.get("watchlist", []),
        created_at=user["created_at"]
    )
    
    return AuthResponse(
        access_token=access_token,
        user=user_response
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        avatar=current_user.get("avatar"),
        watchlist=current_user.get("watchlist", []),
        created_at=current_user["created_at"]
    )

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()
        
        # Check if email is being changed and if it's already taken
        if "email" in update_dict:
            existing_user = await db.users.find_one({
                "email": update_dict["email"],
                "_id": {"$ne": current_user["_id"]}
            })
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already taken"
                )
        
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_dict}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": current_user["_id"]})
        current_user.update(updated_user)
    
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        avatar=current_user.get("avatar"),
        watchlist=current_user.get("watchlist", []),
        created_at=current_user["created_at"]
    )

@router.post("/logout", response_model=MessageResponse)
async def logout_user():
    """Logout user (client-side token removal)"""
    return MessageResponse(message="Successfully logged out")