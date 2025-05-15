
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';

interface RequireAuthProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const RequireAuth = ({ children, adminOnly = false }: RequireAuthProps) => {
  const { user, isAuthLoading, isProfileLoading, session, isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  // Debugging
  console.log("RequireAuth - render", { 
    isAuthLoading, 
    isProfileLoading,
    isAuthenticated,
    isAdmin,
    adminOnly,
    pathname: location.pathname
  });

  useEffect(() => {
    // Wait until auth is no longer loading before making decisions
    if (isAuthLoading || isProfileLoading) {
      return;
    }
    
    // If auth is loaded and user is not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to /auth");
      
      // Prevent multiple redirects
      if (!redirecting) {
        setRedirecting(true);
        
        // Provide visual feedback to user
        toast(t("auth.redirecting_to_login"), {
          description: t("auth.please_login")
        });
        
        // Redirect to login page with return path
        navigate('/auth', { 
          state: { from: location.pathname },
          replace: true // Use replace to avoid building up history stack
        });
      }
      return;
    }
    
    // Handle admin-only routes
    if (adminOnly && !isAdmin) {
      console.log("Access denied: Admin only route");
      
      if (!redirecting) {
        setRedirecting(true);
        
        toast(t("auth.access_denied"), {
          description: t("auth.admin_only")
        });
        
        // Redirect to dashboard for non-admin users
        navigate('/dashboard', { replace: true });
      }
      return;
    }
    
    // Reset redirecting flag if we're authenticated and on the right page
    setRedirecting(false);
    console.log("RequireAuth - User authenticated and authorized");
    
  }, [isAuthLoading, isProfileLoading, isAuthenticated, isAdmin, adminOnly, navigate, location.pathname, redirecting, t]);

  // Show loading while checking auth status
  if (isAuthLoading || isProfileLoading) {
    console.log("RequireAuth - Loading authentication state");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // If user is not authenticated, or this is an admin route and user is not admin,
  // we're in the process of redirecting, so show loading screen
  if ((!isAuthenticated) || (adminOnly && !isAdmin)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // If authenticated and authorized, render the children
  return <>{children}</>;
};

export default RequireAuth;
