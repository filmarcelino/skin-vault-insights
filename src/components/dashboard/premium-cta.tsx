
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumCTAProps {
  isSubscribed: boolean;
}

export const PremiumCTA: React.FC<PremiumCTAProps> = ({ isSubscribed }) => {
  const navigate = useNavigate();

  if (isSubscribed) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm my-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
        <div className="space-y-2 mb-4 md:mb-0">
          <h3 className="flex items-center text-lg font-bold">
            <Crown className="h-5 w-5 mr-2 text-primary" />
            Upgrade to CS Skin Vault Premium
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Get unlimited skins, advanced analytics, and priority support. Start with a 3-day free trial.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          Get Premium
        </Button>
      </CardContent>
    </Card>
  );
};
