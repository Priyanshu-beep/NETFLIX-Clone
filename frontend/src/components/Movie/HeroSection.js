import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Play, Info, Plus, Volume2, VolumeX } from 'lucide-react';
import { moviesAPI } from '../../services/api';
import MovieModal from './MovieModal';

const HeroSection = () => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedMovie = async () => {
      try {
        const movie = await moviesAPI.getFeatured();
        setFeaturedMovie(movie);
      } catch (error) {
        console.error('Failed to fetch featured movie:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedMovie();
  }, []);

  if (loading || !featuredMovie) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(featuredMovie.id);

  const handleWatchlistToggle = async () => {
    try {
      if (inWatchlist) {
        await removeFromWatchlist(featuredMovie.id);
      } else {
        await addToWatchlist(featuredMovie.id);
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  return (
    <>
      <div className="relative h-screen flex items-center justify-start">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={featuredMovie.backdrop_path}
            alt={featuredMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 md:px-8 max-w-2xl">
          {/* Netflix Logo/Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-red-600 font-bold text-sm">N</span>
            <span className="text-white text-sm font-medium tracking-wider">
              {featuredMovie.media_type === 'tv' ? 'SERIES' : 'FILM'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            {featuredMovie.title}
          </h1>

          {/* Description */}
          <p className="text-white text-lg md:text-xl mb-6 leading-relaxed max-w-xl opacity-90">
            {featuredMovie.overview}
          </p>

          {/* Meta Info */}
          <div className="flex items-center space-x-4 text-white mb-8">
            <span className="text-green-500 font-semibold">
              {Math.round(featuredMovie.vote_average * 10)}% Match
            </span>
            <span>{featuredMovie.release_date?.split('-')[0]}</span>
            <span className="border border-gray-400 px-2 py-1 text-sm">
              {featuredMovie.vote_average > 8 ? 'HD' : 'SD'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 text-lg"
              onClick={() => setShowModal(true)}
            >
              <Play className="w-6 h-6 mr-2" />
              Play
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-gray-500 bg-gray-600/50 text-white hover:bg-gray-600 font-semibold px-8 py-3 text-lg backdrop-blur-sm"
              onClick={() => setShowModal(true)}
            >
              <Info className="w-6 h-6 mr-2" />
              More Info
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className={`border-gray-500 text-white font-semibold px-8 py-3 text-lg backdrop-blur-sm ${
                inWatchlist 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-600/50 hover:bg-gray-600'
              }`}
              onClick={handleWatchlistToggle}
            >
              <Plus className="w-6 h-6 mr-2" />
              {inWatchlist ? 'Remove' : 'My List'}
            </Button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="absolute bottom-8 right-8">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/30 hover:bg-black/50 text-white border border-gray-600 rounded-full p-3"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Movie Modal */}
      <MovieModal 
        movie={featuredMovie} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default HeroSection;