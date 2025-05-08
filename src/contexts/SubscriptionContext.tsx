
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
}

// Create context with default values
const SubscriptionContext = createContext<SubscriptionStatus>({
  isSubscribed: false,
  isTrial: false,
  trialDaysRemaining: null,
  subscriptionEnd: null,
  isLoading: true,
  checkSubscription: async () => {},
});

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { session, user } = useAuth();

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const checkSubscription = async () => {
    if (!session?.access_token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
    } catch (err) {
      console.error("Failed to check subscription status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check subscription when session changes
  useEffect(() => {
    if (session) {
      checkSubscription();
    } else {
      // Reset state when logged out
      setIsSubscribed(false);
      setIsTrial(false);
      setTrialDaysRemaining(null);
      setSubscriptionEnd(null);
      setIsLoading(false);
    }
  }, [session]);

  // Periodic check every 30 minutes if user is logged in
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      checkSubscription();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        isTrial,
        trialDaysRemaining,
        subscriptionEnd,
        isLoading,
        checkSubscription
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
