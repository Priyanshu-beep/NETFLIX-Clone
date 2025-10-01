import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, watchlistAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [initializing, setInitializing] = useState(true);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { access_token, user: userData } = response;
      
      localStorage.setItem('netflix_token', access_token);
      localStorage.setItem('netflix_user', JSON.stringify(userData));
      setUser(userData);
      setWatchlist(userData.watchlist || []);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const response = await authAPI.register(email, password, name);
      const { access_token, user: userData } = response;
      
      localStorage.setItem('netflix_token', access_token);
      localStorage.setItem('netflix_user', JSON.stringify(userData));
      setUser(userData);
      setWatchlist(userData.watchlist || []);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('netflix_token');
    localStorage.removeItem('netflix_user');
    setUser(null);
    setWatchlist([]);
    
    // Call logout endpoint (fire and forget)
    authAPI.logout().catch(() => {});
  };

  const addToWatchlist = async (movieId) => {
    try {
      await watchlistAPI.add(movieId);
      const updatedWatchlist = [...watchlist, movieId];
      setWatchlist(updatedWatchlist);
      
      // Update user in localStorage
      if (user) {
        const updatedUser = { ...user, watchlist: updatedWatchlist };
        setUser(updatedUser);
        localStorage.setItem('netflix_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      throw error;
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      await watchlistAPI.remove(movieId);
      const updatedWatchlist = watchlist.filter(id => id !== movieId);
      setWatchlist(updatedWatchlist);
      
      // Update user in localStorage
      if (user) {
        const updatedUser = { ...user, watchlist: updatedWatchlist };
        setUser(updatedUser);
        localStorage.setItem('netflix_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      throw error;
    }
  };

  const refreshWatchlist = async () => {
    try {
      const response = await watchlistAPI.get();
      const watchlistIds = response.watchlist.map(movie => movie.id);
      setWatchlist(watchlistIds);
    } catch (error) {
      console.error('Failed to refresh watchlist:', error);
    }
  };

  const updateProfile = async (data) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem('netflix_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Profile update failed';
      return { success: false, error: message };
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('netflix_token');
      const storedUser = localStorage.getItem('netflix_user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching user profile
          const userData = await authAPI.getProfile();
          setUser(userData);
          setWatchlist(userData.watchlist || []);
          localStorage.setItem('netflix_user', JSON.stringify(userData));
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('netflix_token');
          localStorage.removeItem('netflix_user');
        }
      }
      
      setInitializing(false);
    };
    
    initializeAuth();
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    initializing,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    refreshWatchlist,
    updateProfile,
    isInWatchlist: (movieId) => watchlist.includes(movieId)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};