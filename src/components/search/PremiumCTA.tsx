
import { useState } from "react";
import { Crown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PremiumCTA = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStripeConfig = async () => {
    setIsChecking(true);
    try {
      // Just a simple call to check if the Stripe config is valid
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error checking configuration",
          description: error.message
        });
        return;
      }
      
      if (data?.error?.includes("STRIPE_SECRET_KEY")) {
        toast({
          variant: "destructive",
          title: "Stripe configuration error",
          description: "Please update your Stripe secret key in Settings."
        });
        return;
      }
      
      // If we get here, config is good
      toast({
        title: "Stripe configuration is valid",
        description: "You can now subscribe to premium features."
      });
      
    } catch (err) {
      console.error("Error checking Stripe config:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm my-4 animate-fade-in">
      <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
        <div className="space-y-2 mb-4 md:mb-0">
          <h3 className="flex items-center text-lg font-bold">
            <Crown className="h-5 w-5 mr-2 text-[#FFD700]" />
            Upgrade to CS Skin Vault Premium
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Get unlimited skins, advanced analytics, and priority support. Start with a 7-day free trial.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Button
            onClick={handleCheckStripeConfig}
            variant="outline"
            disabled={isChecking}
            size="sm"
          >
            {isChecking ? "Checking..." : "Check Configuration"}
          </Button>
          <Button 
            onClick={() => navigate('/subscription')}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90"
          >
            Get Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
