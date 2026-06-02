import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  /** One or more roles that are allowed. If omitted, any authenticated user passes. */
  requiredRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role as Role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
