// Supabase Protected Route — redirects unauthenticated users to sign-in
// Package: @supabase/supabase-js
// Place at: src/components/ProtectedRoute.tsx
// Usage: <ProtectedRoute><Dashboard /></ProtectedRoute>
// ---------------------------------------------------

import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
