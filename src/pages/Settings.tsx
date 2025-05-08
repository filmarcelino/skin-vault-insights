import React from "react";
import { JsonSettings } from "@/components/settings/json-settings";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Save, Shield, Wrench, Users, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import { CouponManagement } from "@/components/settings/coupon-management";
import SystemTests from "@/components/settings/system-tests";

const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";

const Settings = () => {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

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
