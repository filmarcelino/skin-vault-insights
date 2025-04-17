
import { SubscriptionManagement } from "@/components/subscription/subscription-management";

const Subscription = () => {
  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Premium Subscription
      </h1>
      
      <p className="text-muted-foreground mb-8 text-center max-w-xl mx-auto">
        Unlock the full potential of CS Skin Vault with premium access. Start with a 3-day free trial.
      </p>
      
      <div className="max-w-3xl mx-auto">
        <SubscriptionManagement />
      </div>
      
      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Testing Information</h2>
        <div className="bg-muted/30 p-4 rounded-lg border border-border backdrop-blur-sm">
          <h3 className="font-medium mb-2 text-primary">Test card details:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="font-medium">Number:</span> 4242 4242 4242 4242
            </li>
            <li className="flex items-center gap-2">
              <span className="font-medium">Expiration date:</span> Any future date
            </li>
            <li className="flex items-center gap-2">
              <span className="font-medium">CVV:</span> Any 3-digit number
            </li>
            <li className="flex items-center gap-2">
              <span className="font-medium">Name:</span> Any name
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            *These details are for testing only. No actual charges will be made.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
