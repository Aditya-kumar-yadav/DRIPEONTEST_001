import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../AppContext';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isAdmin } = useApp();

  if (!user || !isAdmin) {
    console.warn(`[AdminRouteGuard] Unauthorized Access Attempt.`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
