import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';


interface ProtectedRouteProps {
  user: unknown; 
  children: ReactNode;
}

function ProtectedRoute({ user, children }: ProtectedRouteProps) {
  if (!user) { 
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default ProtectedRoute;