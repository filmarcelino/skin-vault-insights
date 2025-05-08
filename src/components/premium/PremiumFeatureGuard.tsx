
import React from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({ 
  children, 
  fallbackMessage = "Esta funcionalidade requer uma assinatura premium" 
}) => {
  const { isSubscribed, isTrial, trialDaysRemaining, isLoading, checkSubscription } = useSubscription();
  const navigate = useNavigate();

  // Allow access during loading to prevent flicker
  if (isLoading) {
    return <>{children}</>;
  }

  // If subscribed or trial is active with remaining days, show the children
  if (isSubscribed || (isTrial && trialDaysRemaining && trialDaysRemaining > 0)) {
    return <>{children}</>;
  }

  const handleSubscribeClick = async () => {
    // Force a fresh check of subscription status before navigating
    try {
      await checkSubscription();
      navigate('/subscription');
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast.error("Erro ao verificar status da assinatura", {
        description: "Tente novamente em alguns instantes."
      });
      navigate('/subscription');
    }
  };

  // Show upgrade card if not subscribed or trial expired
  return (
    <Card className="border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm my-4">
      <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center space-y-4">
        <div className="rounded-full bg-primary/20 p-3">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold">Funcionalidade Premium</h3>
        
        <p className="text-muted-foreground max-w-md">
          {fallbackMessage}
        </p>
        
        {isTrial && trialDaysRemaining === 0 && (
          <p className="text-amber-500 font-medium">
            Seu período de teste expirou
          </p>
        )}
        
        <Button 
          onClick={handleSubscribeClick}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          <Crown className="h-4 w-4 mr-2" />
          Obter Acesso Premium
        </Button>
      </CardContent>
    </Card>
  );
};
