
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const PremiumCTA = () => {
  const navigate = useNavigate();
  
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
        <Button 
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90"
        >
          Get Premium
        </Button>
      </CardContent>
    </Card>
  );
};
