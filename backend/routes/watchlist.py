from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from ..models import Movie, WatchlistResponse, MessageResponse
from ..routes.auth import get_current_user
from ..tmdb_service import TMDBService
from ..server import db

router = APIRouter(prefix="/watchlist", tags=["watchlist"])
tmdb = TMDBService()

@router.get("/", response_model=WatchlistResponse)
async def get_user_watchlist(current_user: dict = Depends(get_current_user)):
    """Get user's watchlist with movie details"""
    watchlist_ids = current_user.get("watchlist", [])
    movies = []
    
    # Get movie details for each ID in watchlist
    for movie_id in watchlist_ids:
        try:
            # Try to get movie details from TMDB
            movie = await tmdb.get_movie_details(movie_id)
            if movie:
                # Convert MovieDetail to Movie for response
                movie_data = Movie(
                    id=movie.id,
                    title=movie.title,
                    overview=movie.overview,
                    poster_path=movie.poster_path,
                    backdrop_path=movie.backdrop_path,
                    release_date=movie.release_date,
                    vote_average=movie.vote_average,
                    genre_ids=movie.genre_ids,
                    media_type=movie.media_type,
                    trailer_url=movie.trailer_url
                )
                movies.append(movie_data)
        except Exception:
            # Skip movies that can't be fetched
            continue
    
    return WatchlistResponse(
        watchlist=movies,
        count=len(movies)
    )

@router.post("/{movie_id}", response_model=MessageResponse)
async def add_to_watchlist(
    movie_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Add movie to user's watchlist"""
    watchlist = current_user.get("watchlist", [])
    
    if movie_id in watchlist:
        raise HTTPException(
            status_code=400,
            detail="Movie already in watchlist"
        )
    
    # Verify movie exists in TMDB
    movie = await tmdb.get_movie_details(movie_id)
    if not movie:
        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )
    
    # Add to watchlist
    watchlist.append(movie_id)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"watchlist": watchlist}}
    )
    
    return MessageResponse(message="Movie added to watchlist")

@router.delete("/{movie_id}", response_model=MessageResponse)
async def remove_from_watchlist(
    movie_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Remove movie from user's watchlist"""
    watchlist = current_user.get("watchlist", [])
    
    if movie_id not in watchlist:
        raise HTTPException(
            status_code=404,
            detail="Movie not in watchlist"
        )
    
    # Remove from watchlist
    watchlist.remove(movie_id)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"watchlist": watchlist}}
    )
    
    return MessageResponse(message="Movie removed from watchlist")