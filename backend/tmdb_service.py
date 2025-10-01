import httpx
import os
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from .models import Movie, TVShow, Genre, MovieDetail
import asyncio

class TMDBService:
    def __init__(self):
        self.api_key = "c8dea14dc917687ac631a52620e4f7ad"  # Primary API key
        self.backup_keys = [
            "3cb41ecea3bf606c56552db3d17adefd",  # Backup key
        ]
        self.base_url = "https://api.themoviedb.org/3"
        self.image_base_url = "https://image.tmdb.org/t/p"
        self.current_key_index = 0
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict[str, Any]:
        """Make API request with fallback to backup keys on rate limit"""
        if params is None:
            params = {}
        
        for attempt in range(len([self.api_key] + self.backup_keys)):
            current_key = self.api_key if attempt == 0 else self.backup_keys[attempt - 1]
            params["api_key"] = current_key
            
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(f"{self.base_url}{endpoint}", params=params)
                    
                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 429:  # Rate limit exceeded
                        if attempt < len(self.backup_keys):
                            continue  # Try next key
                        else:
                            raise HTTPException(
                                status_code=503, 
                                detail="TMDB API rate limit exceeded. Please try again later."
                            )
                    else:
                        response.raise_for_status()
            except httpx.RequestError as e:
                if attempt == len(self.backup_keys):  # Last attempt
                    raise HTTPException(status_code=503, detail=f"TMDB API unavailable: {str(e)}")
                continue
        
        raise HTTPException(status_code=503, detail="TMDB API unavailable")
    
    def get_image_url(self, path: str, size: str = "w500") -> str:
        """Get full image URL from TMDB path"""
        if not path:
            return ""
        return f"{self.image_base_url}/{size}{path}"
    
    async def get_movie_trailer(self, movie_id: int) -> Optional[str]:
        """Get YouTube trailer URL for movie"""
        try:
            data = await self._make_request(f"/movie/{movie_id}/videos")
            videos = data.get("results", [])
            
            # Find YouTube trailer
            for video in videos:
                if (video.get("type") == "Trailer" and 
                    video.get("site") == "YouTube"):
                    return f"https://www.youtube.com/embed/{video['key']}"
            
            # If no trailer found, return first video
            if videos:
                return f"https://www.youtube.com/embed/{videos[0]['key']}"
            
            return None
        except Exception:
            return None
    
    async def get_tv_trailer(self, tv_id: int) -> Optional[str]:
        """Get YouTube trailer URL for TV show"""
        try:
            data = await self._make_request(f"/tv/{tv_id}/videos")
            videos = data.get("results", [])
            
            # Find YouTube trailer
            for video in videos:
                if (video.get("type") == "Trailer" and 
                    video.get("site") == "YouTube"):
                    return f"https://www.youtube.com/embed/{video['key']}"
            
            # If no trailer found, return first video
            if videos:
                return f"https://www.youtube.com/embed/{videos[0]['key']}"
            
            return None
        except Exception:
            return None
    
    async def get_popular_movies(self, page: int = 1) -> List[Movie]:
        """Get popular movies from TMDB"""
        data = await self._make_request("/movie/popular", {"page": page})
        movies = []
        
        for item in data.get("results", []):
            trailer_url = await self.get_movie_trailer(item["id"])
            movie = Movie(
                id=item["id"],
                title=item["title"],
                overview=item["overview"],
                poster_path=self.get_image_url(item.get("poster_path", "")),
                backdrop_path=self.get_image_url(item.get("backdrop_path", ""), "original"),
                release_date=item.get("release_date"),
                vote_average=item.get("vote_average", 0),
                genre_ids=item.get("genre_ids", []),
                media_type="movie",
                trailer_url=trailer_url
            )
            movies.append(movie)
        
        return movies
    
    async def get_trending_content(self, media_type: str = "all", time_window: str = "day") -> List[Movie]:
        """Get trending movies and TV shows"""
        data = await self._make_request(f"/trending/{media_type}/{time_window}")
        content = []
        
        for item in data.get("results", []):
            media_type = item.get("media_type", "movie")
            
            # Get trailer based on media type
            if media_type == "movie":
                trailer_url = await self.get_movie_trailer(item["id"])
                title = item.get("title", "")
                date = item.get("release_date")
            else:
                trailer_url = await self.get_tv_trailer(item["id"])
                title = item.get("name", "")
                date = item.get("first_air_date")
            
            movie = Movie(
                id=item["id"],
                title=title,
                overview=item["overview"],
                poster_path=self.get_image_url(item.get("poster_path", "")),
                backdrop_path=self.get_image_url(item.get("backdrop_path", ""), "original"),
                release_date=date,
                vote_average=item.get("vote_average", 0),
                genre_ids=item.get("genre_ids", []),
                media_type=media_type,
                trailer_url=trailer_url
            )
            content.append(movie)
        
        return content
    
    async def get_movies_by_genre(self, genre_id: int, page: int = 1) -> List[Movie]:
        """Get movies by genre"""
        data = await self._make_request("/discover/movie", {
            "with_genres": genre_id,
            "page": page,
            "sort_by": "popularity.desc"
        })
        
        movies = []
        for item in data.get("results", []):
            trailer_url = await self.get_movie_trailer(item["id"])
            movie = Movie(
                id=item["id"],
                title=item["title"],
                overview=item["overview"],
                poster_path=self.get_image_url(item.get("poster_path", "")),
                backdrop_path=self.get_image_url(item.get("backdrop_path", ""), "original"),
                release_date=item.get("release_date"),
                vote_average=item.get("vote_average", 0),
                genre_ids=item.get("genre_ids", []),
                media_type="movie",
                trailer_url=trailer_url
            )
            movies.append(movie)
        
        return movies
    
    async def search_content(self, query: str, page: int = 1) -> List[Movie]:
        """Search for movies and TV shows"""
        data = await self._make_request("/search/multi", {
            "query": query,
            "page": page
        })
        
        results = []
        for item in data.get("results", []):
            media_type = item.get("media_type")
            
            if media_type not in ["movie", "tv"]:
                continue
            
            # Get appropriate fields based on media type
            if media_type == "movie":
                trailer_url = await self.get_movie_trailer(item["id"])
                title = item.get("title", "")
                date = item.get("release_date")
            else:
                trailer_url = await self.get_tv_trailer(item["id"])
                title = item.get("name", "")
                date = item.get("first_air_date")
            
            movie = Movie(
                id=item["id"],
                title=title,
                overview=item.get("overview", ""),
                poster_path=self.get_image_url(item.get("poster_path", "")),
                backdrop_path=self.get_image_url(item.get("backdrop_path", ""), "original"),
                release_date=date,
                vote_average=item.get("vote_average", 0),
                genre_ids=item.get("genre_ids", []),
                media_type=media_type,
                trailer_url=trailer_url
            )
            results.append(movie)
        
        return results
    
    async def get_movie_details(self, movie_id: int) -> Optional[MovieDetail]:
        """Get detailed movie information"""
        try:
            data = await self._make_request(f"/movie/{movie_id}")
            trailer_url = await self.get_movie_trailer(movie_id)
            
            return MovieDetail(
                id=data["id"],
                title=data["title"],
                overview=data["overview"],
                poster_path=self.get_image_url(data.get("poster_path", "")),
                backdrop_path=self.get_image_url(data.get("backdrop_path", ""), "original"),
                release_date=data.get("release_date"),
                vote_average=data.get("vote_average", 0),
                genre_ids=[g["id"] for g in data.get("genres", [])],
                genres=[Genre(**g) for g in data.get("genres", [])],
                runtime=data.get("runtime"),
                status=data.get("status"),
                tagline=data.get("tagline"),
                budget=data.get("budget"),
                revenue=data.get("revenue"),
                media_type="movie",
                trailer_url=trailer_url
            )
        except Exception:
            return None
    
    async def get_genres(self) -> List[Genre]:
        """Get list of movie genres"""
        movie_data = await self._make_request("/genre/movie/list")
        tv_data = await self._make_request("/genre/tv/list")
        
        # Combine and deduplicate genres
        all_genres = {}
        for genre in movie_data.get("genres", []):
            all_genres[genre["id"]] = Genre(**genre)
        for genre in tv_data.get("genres", []):
            all_genres[genre["id"]] = Genre(**genre)
        
        return list(all_genres.values())
    
    async def get_featured_movie(self) -> Optional[Movie]:
        """Get a featured movie for hero section"""
        # Get trending movies and pick the first one
        trending = await self.get_trending_content("movie", "week")
        if trending:
            return trending[0]
        
        # Fallback to popular movies
        popular = await self.get_popular_movies()
        if popular:
            return popular[0]
        
        return None