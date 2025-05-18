// Let's fix the is_admin property issue
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { prepareExportData, prepareAdminExportData, downloadData } from "@/services/export-service";
import { ExportOptions, ExportDataType, ExportSummary } from "@/services/inventory/inventory-service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Add this interface to correctly define UserProfile with is_admin
interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  full_name?: string;
  is_admin?: boolean;
  city?: string;
  country?: string;
  preferred_currency?: string;
}

export function ExportData() {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportType, setExportType] = useState<ExportDataType>('all');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the current user is an admin
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .maybeSingle();
        
        // Now TypeScript knows that profile might have is_admin property
        setIsAdmin(Boolean(profile?.is_admin));
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Export your inventory data in various formats for backup or analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="options" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="options">Export Options</TabsTrigger>
              <TabsTrigger value="preview">Data Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="options">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="exportType">Data to Export</Label>
                  <Select
                    value={exportType}
                    onValueChange={(value) => setExportType(value as ExportDataType)}
                  >
                    <SelectTrigger id="exportType">
                      <SelectValue placeholder="Select data to export" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">Inventory Only</SelectItem>
                      <SelectItem value="transactions">Transactions Only</SelectItem>
                      <SelectItem value="financial">Financial Summary</SelectItem>
                      <SelectItem value="all">All Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exportFormat">Export Format</Label>
                  <Select
                    value={exportFormat}
                    onValueChange={(value) => setExportFormat(value as 'json' | 'csv')}
                  >
                    <SelectTrigger id="exportFormat">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeDetails"
                    checked={includeDetails}
                    onCheckedChange={setIncludeDetails}
                  />
                  <Label htmlFor="includeDetails">Include detailed information</Label>
                </div>

                {isAdmin && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2 mb-4">
                      <Switch
                        id="adminMode"
                        checked={adminMode}
                        onCheckedChange={setAdminMode}
                      />
                      <Label htmlFor="adminMode">Admin Export Mode</Label>
                    </div>
                    
                    {adminMode && (
                      <div className="space-y-2">
                        <Label htmlFor="targetUserId">User ID (optional)</Label>
                        <Input
                          id="targetUserId"
                          placeholder="Leave empty to export all users' data"
                          value={targetUserId}
                          onChange={(e) => setTargetUserId(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Preview not available. Export the data to view it.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {
              const options = {
                format: exportFormat,
                type: exportType,
                includeDetails
              };
              
              if (adminMode && isAdmin) {
                // Admin export
                setIsLoading(true);
                prepareAdminExportData(options, targetUserId || undefined)
                  .then(({ data, summary }) => {
                    downloadData(data, exportFormat, `admin-export-${exportType}`);
                    toast({
                      title: "Export Complete",
                      description: `Successfully exported ${summary.totalItems} items for ${targetUserId ? 'the specified user' : 'all users'}.`
                    });
                  })
                  .catch(error => {
                    toast({
                      title: "Export Failed",
                      description: error.message,
                      variant: "destructive"
                    });
                  })
                  .finally(() => setIsLoading(false));
              } else {
                // Regular user export
                setIsLoading(true);
                prepareExportData(options)
                  .then(({ data, summary }) => {
                    downloadData(data, exportFormat, `export-${exportType}`);
                    toast({
                      title: "Export Complete",
                      description: `Successfully exported ${summary.totalItems} items.`
                    });
                  })
                  .catch(error => {
                    toast({
                      title: "Export Failed",
                      description: error.message,
                      variant: "destructive"
                    });
                  })
                  .finally(() => setIsLoading(false));
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? "Exporting..." : "Export Data"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
