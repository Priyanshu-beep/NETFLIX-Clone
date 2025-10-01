import React from 'react';
import Header from '../Layout/Header';
import HeroSection from '../Movie/HeroSection';
import MovieRow from '../Movie/MovieRow';
import { popularMovies, trendingShows, actionMovies } from '../../mock/data';

const Browse = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Content Rows */}
        <div className="relative z-10 -mt-32">
          <MovieRow title="Popular on Netflix" movies={popularMovies} />
          <MovieRow title="Trending Now" movies={trendingShows} />
          <MovieRow title="Action Movies" movies={actionMovies} />
          <MovieRow title="Continue Watching" movies={popularMovies.slice(0, 4)} cardSize="small" />
          <MovieRow title="New Releases" movies={[...trendingShows, ...popularMovies].slice(0, 6)} />
          <MovieRow title="Only on Netflix" movies={actionMovies} cardSize="large" />
        </div>
      </main>
      
      {/* Footer spacing */}
      <div className="h-20" />
    </div>
  );
};

export default Browse;