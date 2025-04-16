import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loading } from "@/components/ui/loading";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login page if not authenticated
      navigate('/auth', { state: { from: location.pathname } });
    }
  }, [user, isLoading, navigate, location.pathname]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // If authenticated, render the children
  if (user) {
    return <>{children}</>;
  }

  // Otherwise, render nothing (we're redirecting)
  return null;
};

export default RequireAuth;
