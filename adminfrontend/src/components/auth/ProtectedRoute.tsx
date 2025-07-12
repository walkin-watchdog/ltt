import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isTokenExpired } from '../../utils/auth';


export const ProtectedRoute = ({ children, requiredRoles }: {children: ReactNode, requiredRoles?: string[]}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (!isLoading) setChecked(true);
  }, [isLoading]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  const wasTokenPresent = Boolean(token);
  const unauthenticated = !token || isTokenExpired(token) || !user;

  if (unauthenticated) {
    if (wasTokenPresent) sessionStorage.removeItem('admin_token');
    return (
      <Navigate
        to={`/login${wasTokenPresent ? '?expired=true' : ''}`}
        replace
        state={{ from: location }}
      />
    );

  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};