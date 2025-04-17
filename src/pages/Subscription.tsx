
import { SubscriptionManagement } from "@/components/subscription/subscription-management";

const Subscription = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      
      <div className="max-w-3xl mx-auto">
        <p className="text-muted-foreground mb-6">
          Upgrade to CS Skin Vault Premium to unlock all features and track unlimited skins. Start with a 3-day free trial.
        </p>
        
        <SubscriptionManagement />
      </div>
    </div>
  );
};

export default Subscription;
