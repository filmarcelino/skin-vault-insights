
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DataSourceConfig } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

export const JsonSettings = () => {
  const queryClient = useQueryClient();
  const [useLocal, setUseLocal] = useState(DataSourceConfig.useLocalData);
  const [weaponsPath, setWeaponsPath] = useState(DataSourceConfig.customJsonPaths.weapons);
  const [collectionsPath, setCollectionsPath] = useState(DataSourceConfig.customJsonPaths.collections);
  const [skinsPath, setSkinsPath] = useState(DataSourceConfig.customJsonPaths.skins);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update the global configuration
    DataSourceConfig.useLocalData = useLocal;
    DataSourceConfig.customJsonPaths = {
      weapons: weaponsPath.trim(),
      collections: collectionsPath.trim(),
      skins: skinsPath.trim()
    };
    
    // Invalidate all related queries to force a refresh with new data sources
    queryClient.invalidateQueries({ queryKey: ["skins"] });
    queryClient.invalidateQueries({ queryKey: ["collections"] });
    queryClient.invalidateQueries({ queryKey: ["weapons"] });
    queryClient.invalidateQueries({ queryKey: ["search"] });
    
    toast.success("Data source settings updated", {
      description: "The application will now use your configured data sources"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom JSON Settings</CardTitle>
        <CardDescription>
          Configure custom JSON files for your CS skin data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="use-local" 
              checked={useLocal} 
              onCheckedChange={setUseLocal} 
            />
            <Label htmlFor="use-local">Use local fallback data (when API or custom JSON fails)</Label>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weapons-path">Weapons JSON Path</Label>
              <Input
                id="weapons-path"
                placeholder="data/weapons.json"
                value={weaponsPath}
                onChange={(e) => setWeaponsPath(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Path relative to the public folder
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="collections-path">Collections JSON Path</Label>
              <Input
                id="collections-path"
                placeholder="data/collections.json"
                value={collectionsPath}
                onChange={(e) => setCollectionsPath(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skins-path">Skins JSON Path</Label>
              <Input
                id="skins-path"
                placeholder="data/skins.json"
                value={skinsPath}
                onChange={(e) => setSkinsPath(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={handleSubmit}>Save Settings</Button>
      </CardFooter>
    </Card>
  );
};
