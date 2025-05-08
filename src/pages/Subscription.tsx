
import { SubscriptionManagement } from "@/components/subscription/subscription-management";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Subscription = () => {
  const { isSubscribed, isTrial, trialDaysRemaining, subscriptionEnd } = useSubscription();

  const renderStatus = () => {
    if (isSubscribed && !isTrial) {
      return (
        <Alert className="mb-8 border-primary/40 bg-primary/5">
          <InfoIcon className="h-4 w-4 text-primary" />
          <AlertTitle>Active Subscription</AlertTitle>
          <AlertDescription>
            Your premium subscription is active until {new Date(subscriptionEnd || "").toLocaleDateString()}.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isTrial && trialDaysRemaining && trialDaysRemaining > 0) {
      return (
        <Alert className="mb-8 border-amber-400/40 bg-amber-400/5">
          <InfoIcon className="h-4 w-4 text-amber-400" />
          <AlertTitle>Trial Active</AlertTitle>
          <AlertDescription>
            Your free trial is active with {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isTrial && (!trialDaysRemaining || trialDaysRemaining <= 0)) {
      return (
        <Alert className="mb-8 border-red-400/40 bg-red-400/5">
          <InfoIcon className="h-4 w-4 text-red-400" />
          <AlertTitle>Trial Expired</AlertTitle>
          <AlertDescription>
            Your free trial has expired. Subscribe to continue enjoying premium features.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Premium Subscription
      </h1>
      
      <p className="text-muted-foreground mb-8 text-center max-w-xl mx-auto">
        Unlock the full potential of CS Skin Vault with premium access.
      </p>
      
      {renderStatus()}
      
      <div className="max-w-3xl mx-auto">
        <SubscriptionManagement />
      </div>
    </div>
  );
};

export default Subscription;
