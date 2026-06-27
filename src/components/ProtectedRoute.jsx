// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/',
  allowedRoles = [],
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  const Loader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          جاري التحقق من بياناتك...
        </p>
      </div>
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(user.role);
    if (!isAllowed) {
      return <Navigate to={getRedirectPath(user.role)} replace />;
    }
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={getRedirectPath(user.role)} replace />;
  }

  if (user.is_active === false) {
    return <Navigate to="/account-suspended" replace state={{ from: location }} />;
  }

  return children;
};

const getRedirectPath = (role) => {
  const redirectMap = {
    'client': '/customer/home',
    'customer': '/customer/home',
    'craftsman': '/craftsman/home',
    'admin': '/admin/dashboard',
    'super_admin': '/admin/dashboard',
  };
  return redirectMap[role] || '/';
};

export default ProtectedRoute;