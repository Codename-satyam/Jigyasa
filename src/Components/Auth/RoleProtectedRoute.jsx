import React from 'react';
import { Navigate } from 'react-router-dom';
import auth from '../../api/auth';

function RoleProtectedRoute({ children, requiredRoles = [] }) {
  const user = auth.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default RoleProtectedRoute;
