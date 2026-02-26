import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, hasAccess } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasAccess(user?.role, allowedRoles)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = getDashboardPath(user?.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}

export function getDashboardPath(role: UserRole | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'doctor':
      return '/doctor';
    case 'receptionist':
      return '/reception';
    case 'nurse':
      return '/nurse';
    case 'pharmacy':
      return '/pharmacy';
    case 'laboratory':
      return '/lab';
    case 'billing':
      return '/billing';
    case 'patient':
      return '/patient';
    case 'bloodbank':
      return '/bloodbank';
    default:
      return '/login';
  }
}
