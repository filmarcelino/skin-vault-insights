import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, AlertCircle, CheckCircle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

export const StripeWebhookSettings = () => {
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message?: string} | null>(null);
  const { user } = useAuth();
  
  // Only admins should see this component
  const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!isAdmin) {
    return null;
  }

  const webhookUrl = `https://uxcjewylcwcgmrnzdguu.supabase.co/functions/v1/stripe-webhook`;

  const handleSaveSecret = async () => {
    if (!webhookSecret.trim()) {
      toast.error("Please enter a webhook secret");
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
          <Badge variant="outline" className="ml-2 text-xs">Admin Only</Badge>
        </CardTitle>
        <CardDescription>
          Configure Stripe webhooks to receive real-time subscription updates
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL (to set in Stripe Dashboard)</Label>
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
              title="Copy URL"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Add this URL in your Stripe Dashboard under Developers &gt; Webhooks
          </p>
        </div>
        
        <Separator />
        
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
              {isSaving ? "Saving..." : "Save Secret"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Copy the signing secret provided by Stripe when you create the webhook
          </p>
        </div>
        
        <Separator />
        
        <div>
          <Button 
            variant="outline" 
            onClick={testWebhook}
            className="w-full"
          >
            Test Webhook Configuration
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
              {testResult.success ? "Success" : "Configuration Issue"}
            </AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}
        
        <Alert variant="default" className="bg-blue-500/10 text-blue-600 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Webhook Events to Enable</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Make sure you enable the following events in your Stripe webhook configuration:</p>
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
              Open Stripe Dashboard
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
