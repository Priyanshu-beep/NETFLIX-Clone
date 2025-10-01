import React, { useState, useEffect } from 'react';
import Header from '../Layout/Header';
import MovieCard from '../Movie/MovieCard';
import { useAuth } from '../../contexts/AuthContext';
import { watchlistAPI } from '../../services/api';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { transformMoviesArray } from '../../utils/movieDataTransform';

const MyList = () => {
  const { user, removeFromWatchlist, refreshWatchlist } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await watchlistAPI.get();
        setWatchlistMovies(transformMoviesArray(response.watchlist));
      } catch (error) {
        console.error('Failed to fetch watchlist:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWatchlist();
  }, []);

  const handleRemoveAll = async () => {
    try {
      // Remove all movies from watchlist
      for (const movie of watchlistMovies) {
        await removeFromWatchlist(movie.id);
      }
      setWatchlistMovies([]);
    } catch (error) {
      console.error('Failed to clear watchlist:', error);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    try {
      await removeFromWatchlist(movieId);
      setWatchlistMovies(prev => prev.filter(movie => movie.id !== movieId));
    } catch (error) {
      console.error('Failed to remove movie:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="pt-20 px-4 md:px-8">
          <div className="flex justify-center py-20">
            <div className="text-white text-xl">Loading your list...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-20 px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">My List</h1>
            <p className="text-gray-400">
              {watchlistMovies.length > 0 
                ? `${watchlistMovies.length} title${watchlistMovies.length !== 1 ? 's' : ''} in your list`
                : 'Your list is empty'
              }
            </p>
          </div>
          
          {watchlistMovies.length > 0 && (
            <Button
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
              onClick={handleRemoveAll}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Content */}
        {watchlistMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlistMovies.map((movie) => (
              <div key={movie.id} className="relative group">
                <MovieCard movie={movie} size="normal" />
                
                {/* Quick Remove Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 left-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMovie(movie.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Your list is empty</h3>
            <p className="text-gray-400 mb-6">Add movies and TV shows to your list to watch them later</p>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = '/browse'}
            >
              Browse Content
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyList;