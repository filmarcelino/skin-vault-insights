
import React from "react";
import { JsonSettings } from "@/components/settings/json-settings";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your CS Skin Vault application settings
        </p>
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
