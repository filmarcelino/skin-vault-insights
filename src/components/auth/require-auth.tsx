import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("RequireAuth - Estado de autenticação:", { isLoading, user: user?.email });
    
    if (!isLoading && !user) {
      console.log("Usuário não autenticado, redirecionando para /auth");
      // Fornecer feedback visual ao usuário
      toast("Redirecionando para login", {
        description: "Por favor, faça login para acessar esta página"
      });
      // Redirect to login page if not authenticated
      navigate('/auth', { state: { from: location.pathname } });
    }
  }, [user, isLoading, navigate, location.pathname]);

  // Show loading while checking auth status
  if (isLoading) {
    console.log("RequireAuth - Carregando estado de autenticação");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // If authenticated, render the children
  if (user) {
    console.log("RequireAuth - Usuário autenticado:", user.email);
    return <>{children}</>;
  }

  // Otherwise, render nothing (we're redirecting)
  console.log("RequireAuth - Renderizando null (redirecionando)");
  return null;
};

export default RequireAuth;
