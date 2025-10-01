import React, { useState, useEffect } from 'react';
import Header from '../Layout/Header';
import HeroSection from '../Movie/HeroSection';
import MovieRow from '../Movie/MovieRow';
import { moviesAPI } from '../../services/api';
import { transformMoviesArray } from '../../utils/movieDataTransform';

const Browse = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingContent, setTrendingContent] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [popular, trending, action] = await Promise.all([
          moviesAPI.getPopular(),
          moviesAPI.getTrending('all', 'week'),
          moviesAPI.getByGenre(28), // Action genre ID
        ]);
        
        setPopularMovies(transformMoviesArray(popular));
        setTrendingContent(transformMoviesArray(trending));
        setActionMovies(transformMoviesArray(action));
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Content Rows */}
        <div className="relative z-10 -mt-32">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="text-white text-xl">Loading content...</div>
            </div>
          ) : (
            <>
              <MovieRow title="Popular on Netflix" movies={popularMovies} />
              <MovieRow title="Trending Now" movies={trendingContent} />
              <MovieRow title="Action Movies" movies={actionMovies} />
              <MovieRow title="Continue Watching" movies={popularMovies.slice(0, 4)} cardSize="small" />
              <MovieRow title="New Releases" movies={trendingContent.slice(0, 6)} />
              <MovieRow title="Only on Netflix" movies={actionMovies.slice(0, 5)} cardSize="large" />
            </>
          )}
        </div>
      </main>
      
      {/* Footer spacing */}
      <div className="h-20" />
    </div>
  );
};

export default Browse;