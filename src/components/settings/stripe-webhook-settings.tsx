
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, AlertCircle, CheckCircle, Copy, Key, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

export const StripeWebhookSettings = () => {
  const [webhookSecret, setWebhookSecret] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingStripeKey, setIsSavingStripeKey] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message?: string} | null>(null);
  const { user } = useAuth();
  
  // Admin email para controle de permissões
  const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Caso não tenha usuário autenticado, não mostra nada
  if (!user) {
    return null;
  }

  const webhookUrl = `https://uxcjewylcwcgmrnzdguu.supabase.co/functions/v1/stripe-webhook`;

  const handleSaveSecret = async () => {
    if (!webhookSecret.trim()) {
      toast.error("Please enter a webhook secret");
      return;
    }
    
    if (!isAdmin) {
      toast.error("Apenas administradores podem salvar o webhook secret");
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase.functions.invoke("save-secret", {
        body: { 
          key: "STRIPE_WEBHOOK_SECRET", 
          value: webhookSecret 
        }
      });
      
      if (error) {
        toast.error("Failed to save webhook secret", {
          description: error.message
        });
      } else {
        toast.success("Webhook secret saved successfully");
        setWebhookSecret("");
      }
    } catch (err: any) {
      toast.error("Failed to save webhook secret", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveStripeKey = async () => {
    if (!stripeKey.trim()) {
      toast.error("Please enter your Stripe Secret Key");
      return;
    }
    
    if (!isAdmin) {
      toast.error("Apenas administradores podem salvar a chave Stripe");
      return;
    }
    
    if (!stripeKey.startsWith('sk_')) {
      toast.error("Invalid key format", {
        description: "Stripe Secret Keys must start with 'sk_'"
      });
      return;
    }
    
    setIsSavingStripeKey(true);
    try {
      const { error } = await supabase.functions.invoke("save-stripe-key", {
        body: { stripeKey }
      });
      
      if (error) {
        toast.error("Failed to save Stripe key", {
          description: error.message
        });
      } else {
        toast.success("Stripe key saved successfully");
        setStripeKey("");
      }
    } catch (err: any) {
      toast.error("Failed to save Stripe key", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsSavingStripeKey(false);
    }
  };
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied to clipboard");
  };
  
  const testWebhook = async () => {
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("test-webhook");
      
      if (error) {
        setTestResult({
          success: false,
          message: `Error: ${error.message}`
        });
        return;
      }
      
      if (data?.success) {
        setTestResult({
          success: true,
          message: "Webhook is properly configured!"
        });
      } else {
        setTestResult({
          success: false,
          message: data?.message || "Webhook configuration test failed"
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "An unexpected error occurred"
      });
    }
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Stripe Webhook Settings
          {isAdmin ? (
            <Badge variant="outline" className="ml-2 text-xs">Admin</Badge>
          ) : (
            <Badge variant="outline" className="ml-2 text-xs bg-blue-100">Funcionário</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Configuração do webhook do Stripe para receber atualizações de assinaturas em tempo real
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seção de chave da API do Stripe - apenas Admin */}
        {isAdmin && (
          <>
            <div className="space-y-2">
              <div className="flex items-center">
                <Key className="mr-2 h-4 w-4 text-primary" />
                <Label htmlFor="stripe-key">Stripe Secret Key</Label>
              </div>
              <div className="flex gap-2">
                <Input 
                  id="stripe-key" 
                  value={stripeKey} 
                  onChange={(e) => setStripeKey(e.target.value)}
                  placeholder="sk_live_..." 
                  type="password"
                  className="flex-1 font-mono"
                />
                <Button 
                  onClick={handleSaveStripeKey} 
                  disabled={isSavingStripeKey || !stripeKey.trim()}
                >
                  {isSavingStripeKey ? "Salvando..." : "Salvar Chave"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Digite sua Stripe Secret Key para habilitar funcionalidades de assinatura
              </p>
            </div>
            <Separator />
          </>
        )}

        {/* URL do Webhook - visível para todos */}
        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL do Webhook (para configurar no Dashboard do Stripe)</Label>
          <div className="flex gap-2">
            <Input 
              id="webhook-url" 
              value={webhookUrl} 
              readOnly 
              className="bg-muted"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleCopyUrl}
              title="Copiar URL"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione esta URL no seu Dashboard do Stripe em Developers &gt; Webhooks
          </p>
        </div>
        
        <Separator />
        
        {/* Seção de Webhook Secret - apenas Admin */}
        {isAdmin && (
          <>
            <div className="space-y-2">
              <Label htmlFor="webhook-secret">Webhook Signing Secret</Label>
              <div className="flex gap-2">
                <Input 
                  id="webhook-secret" 
                  value={webhookSecret} 
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..." 
                  className="flex-1"
                />
                <Button 
                  onClick={handleSaveSecret} 
                  disabled={isSaving || !webhookSecret.trim()}
                >
                  {isSaving ? "Salvando..." : "Salvar Secret"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Copie o signing secret fornecido pelo Stripe quando você criar o webhook
              </p>
            </div>
            <Separator />
          </>
        )}
        
        {/* Testar configuração - visível para todos */}
        <div>
          <Button 
            variant="outline" 
            onClick={testWebhook}
            className="w-full"
          >
            Testar Configuração do Webhook
          </Button>
        </div>
        
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {testResult.success ? "Sucesso" : "Problema na configuração"}
            </AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}
        
        {/* Informações sobre webhook - visível para todos */}
        {!isAdmin && testResult && !testResult.success && (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800">
            <Lock className="h-4 w-4" />
            <AlertTitle>Configuração é necessária</AlertTitle>
            <AlertDescription>
              O webhook do Stripe não está configurado ou está com problemas. 
              Entre em contato com um administrador para resolver este problema.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Informações sobre eventos importantes - visível para todos */}
        <Alert variant="default" className="bg-blue-500/10 text-blue-600 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Eventos importantes para habilitar no webhook</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Certifique-se de habilitar os seguintes eventos na configuração do webhook do Stripe:</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>checkout.session.completed</li>
              <li>customer.subscription.created</li>
              <li>customer.subscription.updated</li> 
              <li>customer.subscription.deleted</li>
              <li>invoice.payment_succeeded</li>
              <li>invoice.payment_failed</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            asChild
          >
            <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer">
              Abrir Dashboard do Stripe
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
