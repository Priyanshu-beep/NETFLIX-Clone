# Netflix Clone - Backend Implementation Contracts

## API Contracts

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Movies & TV Shows Endpoints
- `GET /api/movies/featured` - Get featured movie for hero section
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending` - Get trending content
- `GET /api/movies/genre/{genre_id}` - Get movies by genre
- `GET /api/movies/search?q={query}&genre={genre}` - Search movies/shows
- `GET /api/movies/{movie_id}` - Get movie details
- `GET /api/movies/{movie_id}/trailer` - Get movie trailer URL

### Watchlist Endpoints
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist/{movie_id}` - Add movie to watchlist
- `DELETE /api/watchlist/{movie_id}` - Remove movie from watchlist

### Genres Endpoints
- `GET /api/genres` - Get all available genres

## Data Models

### User Model
```python
class User:
    id: str
    email: str
    name: str
    password_hash: str
    avatar: str (optional)
    watchlist: List[int]  # TMDB movie IDs
    created_at: datetime
```

### Movie Model (from TMDB)
```python
class Movie:
    id: int  # TMDB ID
    title: str
    overview: str
    poster_path: str
    backdrop_path: str
    release_date: str
    vote_average: float
    genre_ids: List[int]
    trailer_url: str (YouTube URL)
```

## Mock Data Replacement Plan

### Frontend Mock Data to Replace:
1. **Authentication Context**: Replace mock login/register with real API calls
2. **Featured Movie**: Replace `featuredMovie` from mock with `/api/movies/featured`
3. **Popular Movies**: Replace `popularMovies` with `/api/movies/popular`
4. **Trending Shows**: Replace `trendingShows` with `/api/movies/trending`
5. **Action Movies**: Replace `actionMovies` with `/api/movies/genre/28`
6. **Search Results**: Replace mock search with `/api/movies/search`
7. **Watchlist**: Replace localStorage with `/api/watchlist` endpoints

## TMDB API Integration

### Required API Calls:
1. **Popular Movies**: `/movie/popular`
2. **Trending**: `/trending/all/day` or `/trending/all/week`
3. **Movie Details**: `/movie/{movie_id}`
4. **Movie Videos**: `/movie/{movie_id}/videos` (for trailers)
5. **Search**: `/search/multi`
6. **Genres**: `/genre/movie/list` and `/genre/tv/list`
7. **Discover by Genre**: `/discover/movie?with_genres={genre_id}`

### Image URLs:
- Poster: `https://image.tmdb.org/t/p/w500{poster_path}`
- Backdrop: `https://image.tmdb.org/t/p/original{backdrop_path}`

### Trailer Integration:
- Get video key from TMDB videos endpoint
- Convert to YouTube embed URL: `https://www.youtube.com/embed/{video_key}`

## Frontend-Backend Integration Plan

### Phase 1: Authentication
1. Replace AuthContext mock functions with real API calls
2. Add JWT token management
3. Implement protected routes with token validation

### Phase 2: Movie Data
1. Create movie service to fetch from TMDB
2. Replace all mock data imports with API calls
3. Update movie cards to use TMDB image URLs
4. Implement trailer fetching and YouTube integration

### Phase 3: User Features
1. Implement real watchlist with database persistence
2. Add user profile management
3. Connect search functionality to TMDB API

### Phase 4: Performance & UX
1. Add loading states for API calls
2. Implement error handling and retry logic
3. Add image lazy loading
4. Cache frequently accessed data

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  password_hash: String,
  avatar: String,
  watchlist: [Number], // TMDB movie IDs
  created_at: Date,
  updated_at: Date
}
```

### Sessions/Tokens (if needed for refresh tokens)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  token: String,
  expires_at: Date,
  created_at: Date
}
```

## Error Handling
- 401: Unauthorized (invalid/expired token)
- 404: Movie/User not found
- 429: TMDB API rate limit exceeded
- 500: Internal server error
- 503: TMDB API unavailable

## Testing Strategy
1. Test all authentication flows
2. Test TMDB API integration with different scenarios
3. Test watchlist functionality
4. Test search with various queries
5. Test error handling and edge cases