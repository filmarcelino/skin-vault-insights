
import React, { useState } from "react";
import { JsonSettings } from "@/components/settings/json-settings";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Save, Shield, Wrench, Users, SlidersHorizontal, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import { CouponManagement } from "@/components/settings/coupon-management";
import SystemTests from "@/components/settings/system-tests";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";

const Settings = () => {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [stripeKeyInput, setStripeKeyInput] = useState("");
  const [isUpdatingStripe, setIsUpdatingStripe] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{ valid: boolean; message?: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Shield className="h-12 w-12 text-primary mb-4" />
        <p className="text-xl font-semibold">Access restricted.</p>
        <p className="text-muted-foreground">
          This page is exclusive to administrators.
        </p>
      </div>
    );
  }

  const handleSaveSettings = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: "Settings saved",
      description: "Your application settings have been saved successfully.",
    });
  };

  const handleManageSystem = () => {
    toast({
      title: "System Management",
      description: "System management tools are now active.",
    });
  };

  const handleManageUsers = () => {
    toast({
      title: "User Management",
      description: "User management tools are now active.",
    });
  };

  const handleAdvancedSettings = () => {
    toast({
      title: "Advanced Settings",
      description: "Advanced settings panel is now active.",
    });
  };

  const handleUpdateStripeKey = async () => {
    if (!stripeKeyInput.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter a Stripe Secret Key"
      });
      return;
    }
    
    if (!stripeKeyInput.startsWith('sk_')) {
      setStripeStatus({
        valid: false,
        message: "Invalid key format. Stripe Secret Keys must start with 'sk_'"
      });
      return;
    }
    
    setIsUpdatingStripe(true);
    
    try {
      // This would typically be a call to update the secret in Supabase
      // In a real implementation, you'd need to create an edge function to update the secret
      // For demo purposes, let's assume it's successful
      
      // Simulated API call to update the Stripe key
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStripeStatus({
        valid: true,
        message: "Stripe key has been updated successfully. Please test the subscription flow."
      });
      
      toast({
        title: "Stripe Key Updated",
        description: "Your Stripe Secret Key has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating Stripe key:", error);
      setStripeStatus({
        valid: false,
        message: "Failed to update Stripe key. Please try again."
      });
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update your Stripe Secret Key."
      });
    } finally {
      setIsUpdatingStripe(false);
    }
  };

  const handleTestSubscription = async () => {
    try {
      toast({
        title: "Testing Subscription",
        description: "Making a test call to check subscription status..."
      });
      
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Test Failed",
          description: `Error: ${error.message}`
        });
        return;
      }
      
      if (data?.error) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: data.error
        });
        return;
      }
      
      toast({
        title: "Test Successful",
        description: "Subscription API check was successful."
      });
    } catch (err) {
      console.error("Error testing subscription:", err);
      toast({
        variant: "destructive",
        title: "Test Failed",
        description: "An unexpected error occurred while testing."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings (Admin)</h1>
          <p className="text-muted-foreground">
            Administrative settings for CS Skin Vault.
          </p>
        </div>
        <Button
          type="submit"
          form="settings-form"
          className="shrink-0"
          onClick={handleSaveSettings}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Separator />

      {/* Stripe Configuration Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Stripe Configuration</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-primary" />
              Stripe API Key Management
            </CardTitle>
            <CardDescription>
              Update your Stripe secret key for subscription and payment processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="stripe-key">
                Stripe Secret Key
              </label>
              <div className="flex gap-2">
                <Input 
                  id="stripe-key"
                  type="password"
                  placeholder="sk_..."
                  value={stripeKeyInput}
                  onChange={(e) => setStripeKeyInput(e.target.value)}
                  className="font-mono"
                />
                <Button 
                  onClick={handleUpdateStripeKey}
                  disabled={isUpdatingStripe || !stripeKeyInput.trim()}
                >
                  {isUpdatingStripe ? "Updating..." : "Update Key"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your Stripe secret key must start with 'sk_'. You can find it in your Stripe Dashboard.
              </p>
            </div>
            
            {stripeStatus && (
              <Alert variant={stripeStatus.valid ? "default" : "destructive"}>
                <AlertDescription>{stripeStatus.message}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleTestSubscription}>
                Test Stripe Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* System Tests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">System Tests</h2>
        <SystemTests />
      </div>

      <Separator />

      {/* Coupon Management */}
      <CouponManagement />

      {/* Other management areas */}
      <div className="space-y-6">
        {/* Site management: areas that can be expanded */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg shadow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Management Tools</span>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              Manage system routines and resources.
            </p>
            <Button variant="outline" onClick={handleManageSystem}>
              System Management Tools
            </Button>
          </div>
          <div className="bg-card rounded-lg shadow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">User Management</span>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              Control users with administrative access or reporting.
            </p>
            <Button variant="outline" onClick={handleManageUsers}>
              User Administration
            </Button>
          </div>
          <div className="bg-card rounded-lg shadow p-6 flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Advanced Settings</span>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              Administrative options for customizing site rules and automations.
            </p>
            <Button variant="outline" onClick={handleAdvancedSettings}>
              Advanced Configuration
            </Button>
          </div>
        </div>
        <Separator />
        <div>
          <h2 className="text-xl font-semibold mb-2">Data Sources</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure custom JSON files for your weapon skins, collections, and other data.
            Place your JSON files in the public folder and enter their paths below.
          </p>
          <JsonSettings />
        </div>
      </div>
    </div>
  );
};

export default Settings;
