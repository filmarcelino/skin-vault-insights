
import { SubscriptionManagement } from "@/components/subscription/subscription-management";

const Subscription = () => {
  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Premium Subscription
      </h1>
      
      <p className="text-muted-foreground mb-8 text-center max-w-xl mx-auto">
        Desbloqueie todo o potencial do CS Skin Vault com acesso premium.
      </p>
      
      <div className="max-w-3xl mx-auto">
        <SubscriptionManagement />
      </div>
    </div>
  );
};

export default Subscription;
