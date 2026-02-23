import React from 'react';
import { Navigate } from 'react-router-dom';
import auth from '../../api/auth';

function ProtectedRoute({ children }) {
  const user = auth.getCurrentUser();
  
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is blocked
  if (user && auth.isUserBlocked(user.id)) {
    // Logout the user
    auth.logout();
    return <Navigate to="/blocked" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
