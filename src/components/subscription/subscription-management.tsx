
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, CreditCard, RefreshCw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
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
      
      const { data, error } = await Promise.race([
        supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }),
        new Promise<{data: null, error: Error}>((_, reject) => 
          setTimeout(() => reject(new Error("Tempo limite excedido. Por favor, tente novamente.")), 15000)
        )
      ]) as any;

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

  const handleSubscribe = async (planType: 'monthly' | 'annual' = 'monthly') => {
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
      
      const { data, error } = await Promise.race([
        supabase.functions.invoke('create-checkout', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: { plan: planType }
        }),
        new Promise<{data: null, error: Error}>((_, reject) => 
          setTimeout(() => reject(new Error("Tempo limite excedido. Por favor, tente novamente.")), 15000)
        )
      ]) as any;

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
      
      const { data, error } = await Promise.race([
        supabase.functions.invoke('customer-portal', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }),
        new Promise<{data: null, error: Error}>((_, reject) => 
          setTimeout(() => reject(new Error("Tempo limite excedido. Por favor, tente novamente.")), 15000)
        )
      ]) as any;

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
    <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
      <CardHeader className="bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gradient-to-r from-primary to-accent bg-clip-text">CS Skin Vault Premium</CardTitle>
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
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
            
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur-sm border border-primary/10">
              <h4 className="font-medium mb-2">Seus benefícios premium:</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Skins ilimitadas no inventário</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Análises avançadas e rastreamento de preços</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Suporte prioritário ao cliente</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {status.error && (
              <div className="flex items-center gap-2 text-destructive mb-3 p-2 rounded-md bg-destructive/10">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{status.error}</span>
              </div>
            )}
            
            <Tabs defaultValue="monthly" onValueChange={(val) => setSelectedPlan(val as 'monthly' | 'annual')}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="monthly" className="w-1/2">Mensal</TabsTrigger>
                <TabsTrigger value="annual" className="w-1/2">Anual (10% OFF)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent/5 backdrop-blur-sm border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-3 rounded-full">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Plano Mensal</h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold">$3.99</span>
                          <span className="text-sm text-muted-foreground">/mês</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">3 dias de teste grátis</div>
                  </div>
                  
                  <ul className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Skins ilimitadas no inventário</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Análises avançadas e rastreamento de preços</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Suporte prioritário ao cliente</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="annual">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-br from-accent/20 to-primary/5 backdrop-blur-sm border border-accent/10">
                    <div className="flex items-center gap-3">
                      <div className="bg-accent/20 p-3 rounded-full">
                        <CreditCard className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium">Plano Anual <Badge variant="outline" className="ml-1 bg-green-500/10 text-green-500 border-green-500/30">ECONOMIZE 10%</Badge></h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold">$43.09</span>
                          <span className="text-sm text-muted-foreground">/ano</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Equivalente a $3.59/mês</div>
                      </div>
                    </div>
                    <div className="text-sm">3 dias de teste grátis</div>
                  </div>
                  
                  <ul className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Skins ilimitadas no inventário</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Análises avançadas e rastreamento de preços</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Suporte prioritário ao cliente</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-3 bg-gradient-to-tr from-background to-muted/20 pt-4">
        {status.loading ? (
          <Button disabled className="w-full">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando...
          </Button>
        ) : status.subscribed ? (
          <Button 
            onClick={handleManageSubscription} 
            variant="outline" 
            className="w-full border-primary/30 hover:bg-primary/20"
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
            onClick={() => handleSubscribe(selectedPlan)} 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={isInvoking}
          >
            {isInvoking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando...
              </>
            ) : `Assinar Plano ${selectedPlan === 'monthly' ? 'Mensal' : 'Anual'}`}
          </Button>
        )}
        
        {!status.loading && !isInvoking && (
          <Button 
            onClick={checkSubscription} 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Atualizar</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
