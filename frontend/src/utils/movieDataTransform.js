// Transform backend movie data to frontend expected format
export const transformMovieData = (movie) => {
  if (!movie) return null;
  
  return {
    ...movie,
    poster: movie.poster_path,
    year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
    rating: movie.vote_average > 8 ? 'HD' : 'SD',
    genre: movie.genre_ids ? 'Action' : 'Movie', // Simplified for now
    description: movie.overview,
    trailer: movie.trailer_url
  };
};

// Transform array of movies
export const transformMoviesArray = (movies) => {
  if (!Array.isArray(movies)) return [];
  return movies.map(transformMovieData);
};