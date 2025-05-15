
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface RequireAuthProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const RequireAuth = ({ children, adminOnly = false }: RequireAuthProps) => {
  const { 
    user, 
    isAuthLoading, 
    isProfileLoading, 
    session, 
    isAuthenticated, 
    isAdmin, 
    authStatus 
  } = useAuth();
  const { isLoading: isSubscriptionLoading } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  const [didMount, setDidMount] = useState(false);

  // Debugging
  console.log("RequireAuth - render", { 
    isAuthLoading, 
    isProfileLoading,
    isSubscriptionLoading,
    isAuthenticated,
    isAdmin,
    adminOnly,
    pathname: location.pathname,
    authStatus
  });

  // Set didMount to true after initial render
  useEffect(() => {
    setDidMount(true);
  }, []);

  useEffect(() => {
    // Skip the initial check to prevent redirects during first render
    if (!didMount) return;

    // If authentication is still loading, don't make any decisions yet
    if (isAuthLoading || authStatus === 'loading') {
      console.log("Auth loading, waiting before making decisions");
      return;
    }
    
    // Only check authentication status once it's no longer loading
    if (authStatus === 'unauthenticated' && !isAuthLoading) {
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
    if (adminOnly && !isAdmin && !isProfileLoading) {
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
    
  }, [
    isAuthLoading, 
    isProfileLoading, 
    authStatus, 
    isAuthenticated, 
    isAdmin, 
    adminOnly, 
    navigate, 
    location.pathname, 
    redirecting, 
    t,
    didMount
  ]);

  // Show loading while checking auth status
  if (isAuthLoading || authStatus === 'loading') {
    console.log("RequireAuth - Loading authentication state");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
        <span className="ml-2 text-muted-foreground">{t("auth.checking_auth")}</span>
      </div>
    );
  }

  // If user is not authenticated, show loading while redirecting
  if (authStatus === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
        <span className="ml-2 text-muted-foreground">{t("auth.redirecting_login")}</span>
      </div>
    );
  }

  // Admin check with loading state
  if (adminOnly && !isAdmin && !isProfileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
        <span className="ml-2 text-muted-foreground">{t("auth.checking_permissions")}</span>
      </div>
    );
  }

  // If authenticated and authorized, but still loading profile/subscription - show children with a loading state
  if ((isProfileLoading || isSubscriptionLoading) && isAuthenticated) {
    console.log("Authenticated but loading profile/subscription data");
    return (
      <>
        {children}
        <div className="fixed bottom-4 right-4 bg-background border rounded-md p-2 shadow-md flex items-center space-x-2">
          <Loading size="sm" />
          <span className="text-sm">{t("common.loading_data")}</span>
        </div>
      </>
    );
  }

  console.log("Dashboard ready");

  // If authenticated and authorized, render the children
  return <>{children}</>;
};

export default RequireAuth;
