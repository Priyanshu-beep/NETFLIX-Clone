from fastapi import APIRouter
from typing import List
from models import Genre
from tmdb_service import TMDBService

router = APIRouter(prefix="/genres", tags=["genres"])
tmdb = TMDBService()

@router.get("/", response_model=List[Genre])
async def get_genres():
    """Get all available genres"""
    try:
        genres = await tmdb.get_genres()
        return genres
    except Exception as e:
        return []  # Return empty list if genres can't be fetched