import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('netflix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('netflix_token');
      localStorage.removeItem('netflix_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Movies API
export const moviesAPI = {
  getFeatured: async () => {
    const response = await api.get('/movies/featured');
    return response.data;
  },
  
  getPopular: async (page = 1) => {
    const response = await api.get(`/movies/popular?page=${page}`);
    return response.data;
  },
  
  getTrending: async (mediaType = 'all', timeWindow = 'day') => {
    const response = await api.get(`/movies/trending?media_type=${mediaType}&time_window=${timeWindow}`);
    return response.data;
  },
  
  getByGenre: async (genreId, page = 1) => {
    const response = await api.get(`/movies/genre/${genreId}?page=${page}`);
    return response.data;
  },
  
  search: async (query, page = 1) => {
    const response = await api.get(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`);
    return response.data;
  },
  
  getDetails: async (movieId) => {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
  },
  
  getTrailer: async (movieId) => {
    const response = await api.get(`/movies/${movieId}/trailer`);
    return response.data;
  }
};

// Watchlist API
export const watchlistAPI = {
  get: async () => {
    const response = await api.get('/watchlist');
    return response.data;
  },
  
  add: async (movieId) => {
    const response = await api.post(`/watchlist/${movieId}`);
    return response.data;
  },
  
  remove: async (movieId) => {
    const response = await api.delete(`/watchlist/${movieId}`);
    return response.data;
  }
};

// Genres API
export const genresAPI = {
  getAll: async () => {
    const response = await api.get('/genres');
    return response.data;
  }
};

export default api;