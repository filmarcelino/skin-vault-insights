
import React from "react";
import { JsonSettings } from "@/components/settings/json-settings";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Shield, Save } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your CS Skin Vault application settings
          </p>
        </div>
        <Button type="submit" form="settings-form" className="shrink-0">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
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
