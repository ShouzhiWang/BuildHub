import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Check localStorage as fallback for authentication
  const hasTokenInStorage = localStorage.getItem('access_token') && localStorage.getItem('user');

  // Debug logging
  console.log('ProtectedRoute state:', { 
    isAuthenticated, 
    loading, 
    user: !!user,
    hasTokenInStorage: !!hasTokenInStorage
  });

  if (loading) {
    console.log('ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check both React state and localStorage for authentication
  if (!isAuthenticated && !hasTokenInStorage) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: Authenticated, rendering children');
  return children;
};

export default ProtectedRoute; 