
import React from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({ 
  children, 
  fallbackMessage = "This feature requires a premium subscription" 
}) => {
  const { isSubscribed, isTrial, trialDaysRemaining, isLoading } = useSubscription();
  const navigate = useNavigate();

  // Allow access during loading to prevent flicker
  if (isLoading) {
    return <>{children}</>;
  }

  // If subscribed or trial is active, show the children
  if (isSubscribed) {
    return <>{children}</>;
  }

  // Show upgrade card if not subscribed or trial expired
  return (
    <Card className="border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm my-4">
      <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center space-y-4">
        <div className="rounded-full bg-primary/20 p-3">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold">Premium Feature</h3>
        
        <p className="text-muted-foreground max-w-md">
          {fallbackMessage}
        </p>
        
        {isTrial && trialDaysRemaining === 0 && (
          <p className="text-amber-500 font-medium">
            Your trial has expired
          </p>
        )}
        
        <Button 
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          <Crown className="h-4 w-4 mr-2" />
          Get Premium Access
        </Button>
      </CardContent>
    </Card>
  );
};
