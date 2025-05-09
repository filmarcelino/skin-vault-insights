
import { useState, useEffect } from "react";
import { SubscriptionManagement } from "@/components/subscription/subscription-management";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, AlertCircle, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Subscription = () => {
  const { isSubscribed, isTrial, trialDaysRemaining, subscriptionEnd, checkSubscription } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConfigValid, setIsConfigValid] = useState<boolean | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Verificar a configuração do Stripe na carga inicial
  useEffect(() => {
    const checkStripeConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("test-webhook");
        
        if (error) {
          setIsConfigValid(false);
          setConfigError(`Erro ao verificar configuração: ${error.message}`);
          return;
        }
        
        if (data?.success) {
          setIsConfigValid(true);
          setConfigError(null);
        } else {
          setIsConfigValid(false);
          setConfigError(data?.message || "Configuração do Stripe incompleta");
        }
      } catch (err: any) {
        setIsConfigValid(false);
        setConfigError(`Erro inesperado: ${err.message}`);
      }
    };
    
    checkStripeConfig();
  }, []);

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      await checkSubscription();
      toast.success("Status da assinatura atualizado");
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast.error("Erro ao atualizar status da assinatura");
    } finally {
      setRefreshing(false);
    }
  };

  const renderStatus = () => {
    if (configError) {
      return (
        <Alert className="mb-8 border-red-400/40 bg-red-400/5">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle>Erro de Configuração</AlertTitle>
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
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshStatus} 
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? "Atualizando..." : "Atualizar Status"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isTrial && trialDaysRemaining && trialDaysRemaining > 0) {
      return (
        <Alert className="mb-8 border-amber-400/40 bg-amber-400/5">
          <InfoIcon className="h-4 w-4 text-amber-400" />
          <AlertTitle>Trial Ativo</AlertTitle>
          <AlertDescription>
            Seu período de teste gratuito está ativo com {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia' : 'dias'} restantes.
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshStatus} 
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? "Atualizando..." : "Atualizar Status"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isTrial && (!trialDaysRemaining || trialDaysRemaining <= 0)) {
      return (
        <Alert className="mb-8 border-red-400/40 bg-red-400/5">
          <InfoIcon className="h-4 w-4 text-red-400" />
          <AlertTitle>Trial Expirado</AlertTitle>
          <AlertDescription>
            Seu período de teste gratuito expirou. Assine para continuar aproveitando os recursos premium.
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshStatus} 
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? "Atualizando..." : "Atualizar Status"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshStatus} 
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? "Atualizando..." : "Verificar Status da Assinatura"}
        </Button>
      </div>
    );
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
