
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard } from "lucide-react";

interface PlanProps {
  type: "monthly" | "annual";
}

export const SubscriptionPlan: React.FC<PlanProps> = ({ type }) => {
  const isMonthly = type === "monthly";
  
  return (
    <div className="space-y-4">
      <div className={`flex flex-col gap-3 p-4 rounded-lg ${
        isMonthly 
          ? "bg-gradient-to-br from-primary/20 to-accent/5" 
          : "bg-gradient-to-br from-accent/20 to-primary/5"
        } backdrop-blur-sm border ${
          isMonthly ? "border-primary/10" : "border-accent/10"
        }`}>
        <div className="flex items-center gap-3">
          <div className={`${isMonthly ? "bg-primary/20" : "bg-accent/20"} p-3 rounded-full`}>
            <CreditCard className={`h-5 w-5 ${isMonthly ? "text-primary" : "text-accent"}`} />
          </div>
          <div>
            <h4 className="font-medium">
              {isMonthly ? "Monthly Plan" : (
                <>
                  Annual Plan <Badge variant="outline" className="ml-1 bg-green-500/10 text-green-500 border-green-500/30">SAVE 10%</Badge>
                </>
              )}
            </h4>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{isMonthly ? "$3.99" : "$43.00"}</span>
              <span className="text-sm text-muted-foreground">/{isMonthly ? "month" : "year"}</span>
            </div>
            {!isMonthly && (
              <div className="text-sm text-muted-foreground">Equivalent to $3.58/month</div>
            )}
          </div>
        </div>
      </div>

      <ul className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
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
          <span>Priority support</span>
        </li>
      </ul>
    </div>
  );
};
