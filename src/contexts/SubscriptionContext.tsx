
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define subscription status interface
export interface SubscriptionStatus {
  isSubscribed: boolean;
  isTrial: boolean;
  trialDaysRemaining: number | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  lastChecked: Date | null;
}

// Create context with default values
const SubscriptionContext = createContext<SubscriptionStatus>({
  isSubscribed: false,
  isTrial: false,
  trialDaysRemaining: null,
  subscriptionEnd: null,
  isLoading: true,
  checkSubscription: async () => {},
  lastChecked: null
});

// Debug flag
const DEBUG_SUBSCRIPTION = true;

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [hasCheckedOnce, setHasCheckedOnce] = useState<boolean>(false);
  const { session, user, isAuthenticated, isAuthLoading, authStatus } = useAuth();
  
  const logDebug = (...args: any[]) => {
    if (DEBUG_SUBSCRIPTION) {
      console.log(...args);
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const checkSubscription = async (forceCheck = false) => {
    // Don't check if not authenticated yet
    if (!isAuthenticated || !session?.access_token) {
      setIsLoading(false);
      return;
    }
    
    // If we checked recently (within last 5 minutes) and not forcing a check, use cached data
    if (!forceCheck && lastChecked && (new Date().getTime() - lastChecked.getTime() < 5 * 60 * 1000)) {
      logDebug("Using cached subscription data from", lastChecked);
      return;
    }

    try {
      setIsLoading(true);
      logDebug("Checking subscription status for user", user?.email);
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setIsLoading(false);
        return;
      }
      
      logDebug("Subscription check result:", data);
      setIsSubscribed(data?.subscribed || false);
      setIsTrial(data?.is_trial || false);
      
      if (data?.subscription_end) {
        setSubscriptionEnd(data.subscription_end);
        setTrialDaysRemaining(
          data.is_trial ? calculateDaysRemaining(data.subscription_end) : null
        );
      } else {
        setSubscriptionEnd(null);
        setTrialDaysRemaining(null);
      }
      
      // Update the last checked time
      setLastChecked(new Date());
      setHasCheckedOnce(true);
      logDebug("Subscription status updated");
      console.log("Subscription ready");
    } catch (err) {
      console.error("Failed to check subscription status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check subscription when auth state changes
  useEffect(() => {
    // Don't try to check subscription until auth is loaded
    if (isAuthLoading || authStatus === 'loading') {
      return;
    }
    
    if (isAuthenticated && session && !hasCheckedOnce) {
      logDebug("Auth loaded, checking subscription once");
      checkSubscription();
    } else if (!isAuthenticated) {
      // Reset state when logged out
      setIsSubscribed(false);
      setIsTrial(false);
      setTrialDaysRemaining(null);
      setSubscriptionEnd(null);
      setIsLoading(false);
      setHasCheckedOnce(false);
    }
  }, [isAuthenticated, session, isAuthLoading, authStatus, hasCheckedOnce]);

  // Set up realtime subscription to subscribers table
  useEffect(() => {
    if (!user?.email) return;
    
    // Subscribe to changes in the subscribers table for this user's email
    const channel = supabase
      .channel('subscription-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscribers',
        filter: `email=eq.${user.email}`,
      }, (payload) => {
        logDebug('Subscription updated via webhook:', payload);
        // Force check when the subscription changes
        checkSubscription(true);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        isTrial,
        trialDaysRemaining,
        subscriptionEnd,
        isLoading,
        checkSubscription: () => checkSubscription(true),
        lastChecked
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
