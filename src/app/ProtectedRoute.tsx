import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole, ROLE_DEFAULT_ROUTES } from '../constants/roles';
import { ROUTES } from '../constants/routes';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Route protection and role verification guard matching SaaS ProtectedRoute.tsx pattern.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, authReady } = useAuthStore();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0D3B2E] border-t-transparent" />
          <p className="text-sm font-medium text-gray-600">Verifying session security...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultRoute = ROLE_DEFAULT_ROUTES[user.role] || ROUTES.LOGIN;
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};
