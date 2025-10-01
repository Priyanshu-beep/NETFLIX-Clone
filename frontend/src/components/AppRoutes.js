import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Toaster } from '../components/ui/toaster';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import Browse from '../components/Pages/Browse';
import Search from '../components/Pages/Search';
import MyList from '../components/Pages/MyList';
import Profile from '../components/Pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to browse if already authenticated)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/browse" replace />;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/browse" replace />} />
        
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected routes */}
        <Route path="/browse" element={
          <ProtectedRoute>
            <Browse />
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        } />
        <Route path="/my-list" element={
          <ProtectedRoute>
            <MyList />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/browse" replace />} />
      </Routes>
      
      <Toaster />
    </>
  );
};

export default AppRoutes;