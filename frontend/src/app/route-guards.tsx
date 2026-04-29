import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/app/providers';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Array<'user' | 'admin'> }) {
  const location = useLocation();
  const { hydrated, user, isCheckingSession } = useSession();

  if (!hydrated || isCheckingSession) {
    return null; // The global loader in AuthBootstrap handles this
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
