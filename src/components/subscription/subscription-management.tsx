
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, CreditCard, RefreshCw, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [retryCount, setRetryCount] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  const checkSubscription = async (showToast = true) => {
    if (!session?.access_token || !user) {
      setStatus({ subscribed: false, loading: false });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: undefined }));
      setActionError(null);
      
      console.log("Checking subscription status with token:", session.access_token.substring(0, 10) + "...");
      
      const { data, error } = await Promise.race([
        supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }),
        new Promise<{data: null, error: Error}>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout exceeded. Please try again.")), 30000)
        )
      ]) as any;

      if (error) {
        console.error("Error invoking check-subscription:", error);
        throw new Error(error.message);
      }
      
      console.log("Subscription check response:", data);
      
      // Check if the data contains an error field (from our custom error handling)
      if (data.error) {
        console.warn("Subscription check returned error:", data.error);
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: data.error
        }));
        
        if (showToast) {
          toast({
            title: "Notice",
            description: data.error,
            variant: "default"
          });
        }
        return;
      }
      
      setStatus({
        subscribed: data.subscribed,
        subscription_end: data.subscription_end,
        is_trial: data.is_trial,
        loading: false
      });
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to verify subscription status'
      }));
      
      if (showToast) {
        toast({
          title: "Verification Error",
          description: "Unable to verify your subscription status. Please try again later.",
          variant: "destructive"
        });
      }
      
      // Handle retry logic
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => checkSubscription(false), 3000);
      }
    }
  };

  const handleSubscribe = async (planType: 'monthly' | 'annual' = 'monthly') => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsInvoking(true);
      setActionError(null);
      
      console.log("Starting subscription process for plan:", planType);
      console.log("Using access token:", session.access_token.substring(0, 10) + "...");
      
      const { data, error } = await Promise.race([
        supabase.functions.invoke('create-checkout', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: { plan: planType }
        }),
        new Promise<{data: null, error: Error}>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout exceeded. Please try again.")), 30000)
        )
      ]) as any;

      if (error) {
        console.error("Error invoking create-checkout:", error);
        throw new Error(error.message);
      }
      
      console.log("Checkout response:", data);
      
      // Check if the data contains an error field (from our custom error handling)
      if (data.error) {
        console.error("Checkout returned error:", data.error);
        setActionError(data.error);
        throw new Error(data.error);
      }
      
      if (data.url) {
        console.log("Redirecting to Stripe:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from checkout process");
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to initiate subscription process';
      setActionError(errorMsg);
      
      toast({
        title: "Subscription Error",
        description: errorMsg,
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
      setActionError(null);
      
      console.log("Opening customer portal with token:", session.access_token.substring(0, 10) + "...");
      
      const { data, error } = await Promise.race([
        supabase.functions.invoke('customer-portal', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }),
        new Promise<{data: null, error: Error}>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout exceeded. Please try again.")), 30000)
        )
      ]) as any;

      if (error) {
        console.error("Error invoking customer-portal:", error);
        throw new Error(error.message);
      }
      
      console.log("Customer portal response:", data);
      
      // Check if the data contains an error field (from our custom error handling)
      if (data.error) {
        console.error("Customer portal returned error:", data.error);
        setActionError(data.error);
        throw new Error(data.error);
      }
      
      if (data.url) {
        console.log("Redirecting to customer portal:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from customer portal");
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to open subscription management';
      setActionError(errorMsg);
      
      toast({
        title: "Portal Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsInvoking(false);
    }
  };

  // Check subscription on mount and when authentication changes
  useEffect(() => {
    if (user) {
      console.log("Checking subscription for user:", user.id);
      checkSubscription(false);
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
            Log in to manage your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log in or create an account to access premium features.
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
              Active
            </Badge>
          )}
        </div>
        <CardDescription>
          {status.loading ? (
            "Checking subscription status..."
          ) : status.subscribed ? (
            status.is_trial ? 
              "You are currently in a trial period" : 
              "You have an active premium subscription"
          ) : (
            "Upgrade to access premium features"
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {actionError && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}
      
        {status.loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : status.subscribed ? (
          <>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Active Subscription</span>
            </div>
            
            {status.subscription_end && (
              <p className="text-sm text-muted-foreground">
                Your {status.is_trial ? "trial period ends" : "subscription renews"} on {" "}
                {new Date(status.subscription_end).toLocaleDateString()}
              </p>
            )}
            
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur-sm border border-primary/10">
              <h4 className="font-medium mb-2">Your premium benefits:</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited skins in inventory</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Advanced analytics and price tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority customer support</span>
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
            
            <Alert variant="default" className="mb-4 bg-blue-500/10 border-blue-500/30">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                Make sure you have your <strong>STRIPE_SECRET_KEY</strong> set in the Supabase Edge Function secrets.
              </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="monthly" onValueChange={(val) => setSelectedPlan(val as 'monthly' | 'annual')}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="monthly" className="w-1/2">Monthly</TabsTrigger>
                <TabsTrigger value="annual" className="w-1/2">Annual (10% OFF)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent/5 backdrop-blur-sm border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-3 rounded-full">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Monthly Plan</h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold">$3.99</span>
                          <span className="text-sm text-muted-foreground">/month</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">3-day free trial</div>
                  </div>
                  
                  <ul className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Unlimited skins in inventory</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Advanced analytics and price tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Priority customer support</span>
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
                        <h4 className="font-medium">Annual Plan <Badge variant="outline" className="ml-1 bg-green-500/10 text-green-500 border-green-500/30">SAVE 10%</Badge></h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold">$43.09</span>
                          <span className="text-sm text-muted-foreground">/year</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Equivalent to $3.59/month</div>
                      </div>
                    </div>
                    <div className="text-sm">3-day free trial</div>
                  </div>
                  
                  <ul className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Unlimited skins in inventory</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Advanced analytics and price tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Priority customer support</span>
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
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
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
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
              </>
            ) : "Manage Subscription"}
          </Button>
        ) : (
          <Button 
            onClick={() => handleSubscribe(selectedPlan)} 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={isInvoking}
          >
            {isInvoking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
              </>
            ) : `Subscribe to ${selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Plan`}
          </Button>
        )}
        
        {!status.loading && !isInvoking && (
          <Button 
            onClick={() => checkSubscription(true)} 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
