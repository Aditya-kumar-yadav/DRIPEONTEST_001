import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

interface CustomerRouteGuardProps {
  children: React.ReactNode;
}

export default function CustomerRouteGuard({ children }: CustomerRouteGuardProps) {
  const { user, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) return null; // Wait for Clerk to initialize

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}
