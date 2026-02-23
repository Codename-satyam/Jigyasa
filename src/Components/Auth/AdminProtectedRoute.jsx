import React from 'react';
import { Navigate } from 'react-router-dom';
import * as auth from '../../api/auth';

function AdminProtectedRoute({ children }) {
  const user = auth.getCurrentUser?.();
  
  // Check if user exists and has admin role
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Check if user is blocked
  if (auth.isUserBlocked?.(user.id)) {
    // Logout the user
    auth.logout?.();
    return <Navigate to="/blocked" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
