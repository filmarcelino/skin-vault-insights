
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface PremiumCTAProps {
  isSubscribed?: boolean;
}

export const PremiumCTA: React.FC<PremiumCTAProps> = ({ isSubscribed: propIsSubscribed }) => {
  const navigate = useNavigate();
  const { isSubscribed: contextIsSubscribed, isTrial, trialDaysRemaining } = useSubscription();
  
  // Use prop if provided, otherwise use context value
  const isSubscribed = propIsSubscribed !== undefined ? propIsSubscribed : contextIsSubscribed;

  // Don't show if user is fully subscribed (paid subscription)
  if (isSubscribed && !isTrial) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm my-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
        <div className="space-y-2 mb-4 md:mb-0">
          <h3 className="flex items-center text-lg font-bold">
            <Crown className="h-5 w-5 mr-2 text-primary" />
            Upgrade to CS Skin Vault Premium
          </h3>
          
          {isTrial && trialDaysRemaining && trialDaysRemaining > 0 ? (
            <p className="text-sm text-muted-foreground max-w-md">
              You have {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} left in your free trial. 
              Upgrade now to maintain access to all premium features.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground max-w-md">
              Get unlimited skins, advanced analytics, and priority support.
            </p>
          )}
        </div>
        
        <Button 
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isTrial && trialDaysRemaining && trialDaysRemaining > 0 ? "Upgrade Now" : "Get Premium"}
        </Button>
      </CardContent>
    </Card>
  );
};
