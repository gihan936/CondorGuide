// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (!storedUser) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(storedUser.role)) {
    // Logged in but doesn't have required role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
