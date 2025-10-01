import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Plus, Play, ChevronDown } from 'lucide-react';
import MovieModal from './MovieModal';
import { transformMovieData } from '../../utils/movieDataTransform';

const MovieCard = ({ movie, size = 'normal' }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const transformedMovie = transformMovieData(movie);
  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistToggle = (e) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  const sizeClasses = {
    small: 'w-32 h-48',
    normal: 'w-48 h-64',
    large: 'w-56 h-80'
  };

  return (
    <MovieModal 
      movie={movie} 
      isOpen={showModal} 
      onClose={() => setShowModal(false)}
    >
      <div 
        className={`${sizeClasses[size]} relative group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-10`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowModal(true)}
      >
        {/* Movie Poster */}
        <div className="w-full h-full rounded-lg overflow-hidden shadow-xl">
          <img
            src={transformedMovie.poster}
            alt={transformedMovie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Top section */}
            <div>
              <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                {movie.title}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-gray-300 mb-3">
                <span>{movie.year}</span>
                <span className="border border-gray-500 px-1 text-xs">{movie.rating}</span>
              </div>
            </div>

            {/* Bottom section */}
            <div>
              <p className="text-gray-300 text-xs mb-4 line-clamp-3">
                {movie.genre}
              </p>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200 p-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                >
                  <Play className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className={`border-gray-500 text-white p-2 rounded-full ${
                    inWatchlist 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-600/50 hover:bg-gray-600'
                  }`}
                  onClick={handleWatchlistToggle}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-gray-800 p-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist indicator */}
        {inWatchlist && (
          <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
            <Plus className="w-3 h-3" />
          </div>
        )}
      </div>
    </MovieModal>
  );
};

export default MovieCard;