import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, isLoading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log("RequireAuth - Authentication state:", { 
      isLoading, 
      user: user?.email, 
      session: session ? "Active" : "None" 
    });
    
    if (!isLoading && !user) {
      console.log("User not authenticated, redirecting to /auth");
      
      // Prevent multiple redirects
      if (!redirecting) {
        setRedirecting(true);
        
        // Provide visual feedback to user
        toast("Redirecionando para login", {
          description: "Por favor, faça login para acessar esta página"
        });
        
        // Redirect to login page with return path
        navigate('/auth', { state: { from: location.pathname } });
      }
    }
  }, [user, isLoading, navigate, location.pathname, session, redirecting]);

  // Show loading while checking auth status
  if (isLoading) {
    console.log("RequireAuth - Loading authentication state");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // If authenticated, render the children
  if (user && session) {
    console.log("RequireAuth - User authenticated:", user.email);
    return <>{children}</>;
  }

  // Otherwise, render nothing (we're redirecting)
  console.log("RequireAuth - Rendering null (redirecting)");
  return null;
};

export default RequireAuth;
