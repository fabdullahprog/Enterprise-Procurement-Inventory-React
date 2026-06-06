 import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
}

const ProtectedRoute = ({ children, roles, permissions }: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole, hasPermission, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0) {
    const allowed = roles.some(r => hasRole(r));
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (permissions && permissions.length > 0) {
    const allowed = permissions.some(p => hasPermission(p));
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;