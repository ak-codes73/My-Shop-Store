import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminGuard = ({ children }) => {
  const { isAdminAuthenticated, loadingAdmin } = useAuth();
  const location = useLocation();

  if (loadingAdmin) {
    return (
      <div className="min-h-screen bg-charcoal text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase font-bold tracking-widest text-charcoal-400">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};
