
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

  const checkSubscription = async () => {
    if (!session?.access_token || !user) {
      setStatus({ subscribed: false, loading: false });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw new Error(error.message);
      
      setStatus({
        subscribed: data.subscribed,
        subscription_end: data.subscription_end,
        is_trial: data.is_trial,
        loading: false
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      setStatus({
        subscribed: false,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to check subscription status'
      });
    }
  };

  const handleSubscribe = async () => {
    if (!session?.access_token) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw new Error(error.message);
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      toast({
        title: "Subscription error",
        description: err instanceof Error ? err.message : 'Failed to start subscription process',
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.access_token) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw new Error(error.message);
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      toast({
        title: "Portal error",
        description: err instanceof Error ? err.message : 'Failed to open subscription management',
        variant: "destructive"
      });
    }
  };

  // Check subscription on mount and when auth changes
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
            Please log in to manage your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Login or create an account to access premium features.
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
              Active
            </Badge>
          )}
        </div>
        <CardDescription>
          {status.loading ? (
            "Checking subscription status..."
          ) : status.subscribed ? (
            status.is_trial ? 
              "You're currently on a trial period" : 
              "You have an active premium subscription"
          ) : (
            "Upgrade to access premium features"
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
              <span className="font-medium">Subscription active</span>
            </div>
            
            {status.subscription_end && (
              <p className="text-sm text-muted-foreground">
                Your subscription {status.is_trial ? "trial ends" : "renews"} on {" "}
                {new Date(status.subscription_end).toLocaleDateString()}
              </p>
            )}
            
            <div className="bg-muted/50 p-3 rounded-md">
              <h4 className="font-medium mb-2">Your premium benefits:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Unlimited skins in inventory
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Advanced analytics and price tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Priority customer support
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
                  <h4 className="font-medium">Premium Plan</h4>
                  <p className="text-sm text-muted-foreground">$3.99/month with 3-day free trial</p>
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <h4 className="font-medium mb-2">Premium benefits:</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Unlimited skins in inventory
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Advanced analytics and price tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority customer support
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
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
          </Button>
        ) : status.subscribed ? (
          <Button onClick={handleManageSubscription} variant="outline" className="w-full">
            Manage Subscription
          </Button>
        ) : (
          <Button onClick={handleSubscribe} className="w-full">
            Subscribe Now
          </Button>
        )}
        
        {!status.loading && (
          <Button onClick={checkSubscription} variant="ghost" size="icon">
            <Loader2 className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
