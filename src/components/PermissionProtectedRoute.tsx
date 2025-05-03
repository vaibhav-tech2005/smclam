
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

/**
 * A route component that checks if the user has the required permission to access the route.
 * Admin users can access all routes regardless of permissions.
 */
const PermissionProtectedRoute = ({ 
  children, 
  requiredPermission 
}: PermissionProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Check if user has the required permission or is admin
  if (requiredPermission && !isAdmin) {
    const userHasPermission = hasPermission(requiredPermission);
    
    if (!userHasPermission) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
};

export default PermissionProtectedRoute;
