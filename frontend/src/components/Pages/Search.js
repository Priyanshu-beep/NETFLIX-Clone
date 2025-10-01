import React, { useState, useEffect } from 'react';
import Header from '../Layout/Header';
import MovieCard from '../Movie/MovieCard';
import { useAuth } from '../../contexts/AuthContext';
import { moviesAPI } from '../../services/api';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { transformMoviesArray } from '../../utils/movieDataTransform';

const Search = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await moviesAPI.search(query);
      let filteredResults = results;
      
      // Filter by type if specified
      if (selectedType !== 'all') {
        filteredResults = filteredResults.filter(item => 
          selectedType === 'movie' ? item.media_type === 'movie' : item.media_type === 'tv'
        );
      }
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    // Get query from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      setSearchQuery(q);
      handleSearch(q);
    }
  }, []);

  React.useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [selectedType]);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-20 px-4 md:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-6">Search</h1>
          
          {/* Search Form */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for movies and TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 bg-gray-800 border-gray-600 text-white placeholder-gray-400 h-12 text-lg"
              />
            </div>
            
            <Button
              onClick={() => handleSearch()}
              className="bg-red-600 hover:bg-red-700 text-white px-8 h-12 text-lg font-semibold"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="tv">TV Shows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-xl">Searching...</div>
          </div>
        ) : (
          <div>
            {searchQuery && (
              <div className="mb-6">
                <h2 className="text-white text-xl font-semibold">
                  {searchResults.length > 0 
                    ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                    : `No results found for "${searchQuery}"`
                  }
                </h2>
              </div>
            )}
            
            {/* Results Grid */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.map((item) => (
                  <MovieCard key={`${item.media_type}-${item.id}`} movie={item} size="normal" />
                ))}
              </div>
            ) : (
              !searchQuery && (
                <div className="text-center py-20">
                  <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">Start Your Search</h3>
                  <p className="text-gray-400">Search for movies and TV shows by title</p>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;