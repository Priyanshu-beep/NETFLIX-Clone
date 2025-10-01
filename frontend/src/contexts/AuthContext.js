import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../mock/data';

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

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Mock login - in production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(mockUser);
      setWatchlist(mockUser.watchlist || []);
      localStorage.setItem('netflix_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      // Mock registration - in production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser = {
        ...mockUser,
        email,
        name,
        watchlist: []
      };
      setUser(newUser);
      setWatchlist([]);
      localStorage.setItem('netflix_user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setWatchlist([]);
    localStorage.removeItem('netflix_user');
  };

  const addToWatchlist = (movieId) => {
    const updatedWatchlist = [...watchlist, movieId];
    setWatchlist(updatedWatchlist);
    if (user) {
      const updatedUser = { ...user, watchlist: updatedWatchlist };
      setUser(updatedUser);
      localStorage.setItem('netflix_user', JSON.stringify(updatedUser));
    }
  };

  const removeFromWatchlist = (movieId) => {
    const updatedWatchlist = watchlist.filter(id => id !== movieId);
    setWatchlist(updatedWatchlist);
    if (user) {
      const updatedUser = { ...user, watchlist: updatedWatchlist };
      setUser(updatedUser);
      localStorage.setItem('netflix_user', JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('netflix_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setWatchlist(userData.watchlist || []);
    }
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist: (movieId) => watchlist.includes(movieId)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};