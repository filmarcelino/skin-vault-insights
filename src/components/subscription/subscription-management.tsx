
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, CreditCard } from "lucide-react";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_end?: string;
  is_trial?: boolean;
  loading: boolean;
  error?: string;
}

export const SubscriptionManagement = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    loading: true
  });
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isInvoking, setIsInvoking] = useState(false);

  const checkSubscription = async () => {
    if (!session?.access_token || !user) {
      setStatus({ subscribed: false, loading: false });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      // Adicionando timeout para evitar que a requisição fique pendente indefinidamente
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Tempo limite excedido")), 10000)
      );
      
      const fetchPromise = supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      // Race entre o timeout e a requisição
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) throw new Error(error.message);
      
      setStatus({
        subscribed: data.subscribed,
        subscription_end: data.subscription_end,
        is_trial: data.is_trial,
        loading: false
      });
    } catch (err) {
      console.error('Erro ao verificar assinatura:', err);
      setStatus({
        subscribed: false,
        loading: false,
        error: err instanceof Error ? err.message : 'Falha ao verificar o status da assinatura'
      });
      
      toast({
        title: "Erro de verificação",
        description: "Não foi possível verificar seu status de assinatura. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const handleSubscribe = async () => {
    if (!session?.access_token) {
      toast({
        title: "Autenticação necessária",
        description: "Por favor, faça login para assinar",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsInvoking(true);
      
      // Adicionando timeout para evitar que a requisição fique pendente indefinidamente
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Tempo limite excedido")), 10000)
      );
      
      const fetchPromise = supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      // Race entre o timeout e a requisição
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) throw new Error(error.message);
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Erro ao criar checkout:', err);
      toast({
        title: "Erro de assinatura",
        description: err instanceof Error ? err.message : 'Falha ao iniciar o processo de assinatura',
        variant: "destructive"
      });
    } finally {
      setIsInvoking(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.access_token) return;
    
    try {
      setIsInvoking(true);
      
      // Adicionando timeout para evitar que a requisição fique pendente indefinidamente
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Tempo limite excedido")), 10000)
      );
      
      const fetchPromise = supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      // Race entre o timeout e a requisição
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) throw new Error(error.message);
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Erro ao abrir portal do cliente:', err);
      toast({
        title: "Erro do portal",
        description: err instanceof Error ? err.message : 'Falha ao abrir gerenciamento de assinatura',
        variant: "destructive"
      });
    } finally {
      setIsInvoking(false);
    }
  };

  // Verificar assinatura ao montar e quando a autenticação muda
  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setStatus({ subscribed: false, loading: false });
    }
  }, [user, session]);

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>CS Skin Vault Premium</CardTitle>
          <CardDescription>
            Faça login para gerenciar sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Faça login ou crie uma conta para acessar recursos premium.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>CS Skin Vault Premium</CardTitle>
          {status.subscribed && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              Ativo
            </Badge>
          )}
        </div>
        <CardDescription>
          {status.loading ? (
            "Verificando status da assinatura..."
          ) : status.subscribed ? (
            status.is_trial ? 
              "Você está atualmente em um período de teste" : 
              "Você tem uma assinatura premium ativa"
          ) : (
            "Faça upgrade para acessar recursos premium"
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status.loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : status.subscribed ? (
          <>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Assinatura ativa</span>
            </div>
            
            {status.subscription_end && (
              <p className="text-sm text-muted-foreground">
                Sua {status.is_trial ? "período de teste termina" : "assinatura renova"} em {" "}
                {new Date(status.subscription_end).toLocaleDateString()}
              </p>
            )}
            
            <div className="bg-muted/50 p-3 rounded-md">
              <h4 className="font-medium mb-2">Seus benefícios premium:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Skins ilimitadas no inventário
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Análises avançadas e rastreamento de preços
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Suporte prioritário ao cliente
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {status.error && (
              <div className="flex items-center gap-2 text-destructive mb-3">
                <AlertCircle className="h-5 w-5" />
                <span>{status.error}</span>
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Plano Premium</h4>
                  <p className="text-sm text-muted-foreground">$3.99/mês com 3 dias de teste grátis</p>
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <h4 className="font-medium mb-2">Benefícios premium:</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Skins ilimitadas no inventário
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Análises avançadas e rastreamento de preços
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Suporte prioritário ao cliente
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-3">
        {status.loading ? (
          <Button disabled className="w-full">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando...
          </Button>
        ) : status.subscribed ? (
          <Button 
            onClick={handleManageSubscription} 
            variant="outline" 
            className="w-full"
            disabled={isInvoking}
          >
            {isInvoking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando...
              </>
            ) : "Gerenciar Assinatura"}
          </Button>
        ) : (
          <Button 
            onClick={handleSubscribe} 
            className="w-full"
            disabled={isInvoking}
          >
            {isInvoking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando...
              </>
            ) : "Assinar Agora"}
          </Button>
        )}
        
        {!status.loading && !isInvoking && (
          <Button onClick={checkSubscription} variant="ghost" size="icon">
            <Loader2 className="h-4 w-4" />
            <span className="sr-only">Atualizar</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

