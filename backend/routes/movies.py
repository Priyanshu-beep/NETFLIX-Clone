from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from ..models import Movie, MovieDetail, SearchResult, Genre
from ..tmdb_service import TMDBService
from ..routes.auth import get_current_user

router = APIRouter(prefix="/movies", tags=["movies"])
tmdb = TMDBService()

@router.get("/featured", response_model=Movie)
async def get_featured_movie():
    """Get featured movie for hero section"""
    movie = await tmdb.get_featured_movie()
    if not movie:
        raise HTTPException(status_code=404, detail="No featured movie found")
    return movie

@router.get("/popular", response_model=List[Movie])
async def get_popular_movies(page: int = Query(1, ge=1, le=500)):
    """Get popular movies"""
    try:
        movies = await tmdb.get_popular_movies(page)
        return movies
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/trending", response_model=List[Movie])
async def get_trending_content(
    media_type: str = Query("all", regex="^(all|movie|tv)$"),
    time_window: str = Query("day", regex="^(day|week)$")
):
    """Get trending movies and TV shows"""
    try:
        content = await tmdb.get_trending_content(media_type, time_window)
        return content
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/genre/{genre_id}", response_model=List[Movie])
async def get_movies_by_genre(
    genre_id: int,
    page: int = Query(1, ge=1, le=500)
):
    """Get movies by genre"""
    try:
        movies = await tmdb.get_movies_by_genre(genre_id, page)
        return movies
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/search", response_model=List[Movie])
async def search_content(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1, le=500)
):
    """Search movies and TV shows"""
    try:
        results = await tmdb.search_content(q, page)
        return results
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/{movie_id}", response_model=MovieDetail)
async def get_movie_details(movie_id: int):
    """Get detailed movie information"""
    movie = await tmdb.get_movie_details(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.get("/{movie_id}/trailer", response_model=dict)
async def get_movie_trailer(movie_id: int):
    """Get movie trailer URL"""
    trailer_url = await tmdb.get_movie_trailer(movie_id)
    if not trailer_url:
        raise HTTPException(status_code=404, detail="Trailer not found")
    return {"trailer_url": trailer_url}