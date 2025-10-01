import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Play, Plus, ThumbsUp, Info, X } from 'lucide-react';
import { transformMovieData } from '../../utils/movieDataTransform';

const MovieModal = ({ movie, isOpen, onClose, children }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inWatchlist = isInWatchlist(movie?.id);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  const handlePlayTrailer = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  if (!movie) return children;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl w-full h-[80vh] bg-black border-gray-800 p-0 overflow-hidden">
          <div className="relative h-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Movie Info */}
            <div className="h-full flex flex-col">
              {/* Trailer Section */}
              <div className="relative flex-1 bg-black">
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <iframe
                    src={movie.trailer}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={movie.title}
                  />
                </div>
                
                {/* Fullscreen Toggle */}
                <Button
                  className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handlePlayTrailer}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Fullscreen
                </Button>
              </div>

              {/* Movie Details */}
              <div className="p-6 bg-gray-900">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{movie.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                      <span>{movie.year}</span>
                      <span className="border border-gray-500 px-1">{movie.rating}</span>
                      <span>{movie.genre}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {movie.description || `Experience the thrilling world of ${movie.title}. This ${movie.genre.toLowerCase()} will keep you on the edge of your seat with its compelling storyline and outstanding performances.`}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <Button
                    className="bg-white text-black hover:bg-gray-200 font-semibold px-6"
                    onClick={handlePlayTrailer}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play
                  </Button>
                  
                  <Button
                    variant="outline"
                    className={`border-gray-500 text-white hover:bg-gray-800 px-6 ${
                      inWatchlist ? 'bg-gray-700' : 'bg-gray-600/50'
                    }`}
                    onClick={handleWatchlistToggle}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {inWatchlist ? 'Remove from List' : 'Add to List'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-800 p-2 rounded-full"
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
            onClick={handleCloseFullscreen}
          >
            <X className="w-6 h-6" />
          </Button>
          
          <iframe
            src={movie.trailer}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={movie.title}
          />
        </div>
      )}
    </>
  );
};

export default MovieModal;