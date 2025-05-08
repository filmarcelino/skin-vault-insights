
import { useState, useEffect } from "react";
import { SubscriptionManagement } from "@/components/subscription/subscription-management";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, AlertCircle, Settings, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Subscription = () => {
  const { isSubscribed, isTrial, trialDaysRemaining, subscriptionEnd, checkSubscription } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConfigValid, setIsConfigValid] = useState<boolean | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Check for success parameter in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const sessionId = queryParams.get('session_id');
    
    if (success === 'true' && sessionId) {
      setShowSuccessMessage(true);
      
      // Refresh subscription status
      checkSubscription().then(() => {
        toast.success("Assinatura realizada com sucesso!", {
          description: "Seu acesso premium foi ativado."
        });
      });
      
      // Clean up URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location.search, checkSubscription]);

  const renderStatus = () => {
    if (showSuccessMessage) {
      return (
        <Alert className="mb-8 border-green-500/40 bg-green-500/5">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Assinatura realizada com sucesso!</AlertTitle>
          <AlertDescription>
            Obrigado por assinar o CS Skin Vault Premium. Seu acesso aos recursos premium já está ativo.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (configError) {
      return (
        <Alert className="mb-8 border-red-400/40 bg-red-400/5">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle>Erro de configuração</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{configError}</p>
            {isAdmin && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigate('/settings')}
                className="mt-2"
              >
                <Settings className="h-4 w-4 mr-2" />
                Ir para Configurações
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }
  
    if (isSubscribed && !isTrial) {
      return (
        <Alert className="mb-8 border-primary/40 bg-primary/5">
          <InfoIcon className="h-4 w-4 text-primary" />
          <AlertTitle>Assinatura Ativa</AlertTitle>
          <AlertDescription>
            Sua assinatura premium está ativa até {new Date(subscriptionEnd || "").toLocaleDateString()}.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isTrial && trialDaysRemaining && trialDaysRemaining > 0) {
      return (
        <Alert className="mb-8 border-amber-400/40 bg-amber-400/5">
          <InfoIcon className="h-4 w-4 text-amber-400" />
          <AlertTitle>Período de Teste Ativo</AlertTitle>
          <AlertDescription>
            Seu período de teste gratuito está ativo com {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia' : 'dias'} restantes.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isTrial && (!trialDaysRemaining || trialDaysRemaining <= 0)) {
      return (
        <Alert className="mb-8 border-red-400/40 bg-red-400/5">
          <InfoIcon className="h-4 w-4 text-red-400" />
          <AlertTitle>Período de Teste Expirado</AlertTitle>
          <AlertDescription>
            Seu período de teste gratuito expirou. Assine para continuar aproveitando os recursos premium.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Assinatura Premium
      </h1>
      
      <p className="text-muted-foreground mb-8 text-center max-w-xl mx-auto">
        Desbloqueie todo o potencial do CS Skin Vault com acesso premium.
      </p>
      
      {renderStatus()}
      
      <div className="max-w-3xl mx-auto">
        <SubscriptionManagement />
      </div>
    </div>
  );
};

export default Subscription;
