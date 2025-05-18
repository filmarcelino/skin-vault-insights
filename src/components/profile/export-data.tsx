
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, FileJson, FileSpreadsheet, UserCheck } from "lucide-react";
import { 
  ExportDataType, 
  ExportOptions, 
  ExportSummary, 
  prepareExportData,
  prepareAdminExportData, 
  downloadData 
} from "@/services/export-service";
import { formatCurrency } from "@/utils/financial-utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";

export const ExportData: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportType, setExportType] = useState<ExportDataType>("all");
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [includeDetails, setIncludeDetails] = useState(true);
  const [summary, setSummary] = useState<ExportSummary | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const { currency } = useCurrency();
  const { profile } = useAuth();
  
  useEffect(() => {
    // Check if the user has admin privileges
    if (profile && profile.is_admin === true) {
      setIsAdmin(true);
    }
  }, [profile]);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      
      const options: ExportOptions = {
        type: exportType,
        format: exportFormat,
        includeDetails
      };
      
      // Use the appropriate export function based on user role
      const { data, summary } = isAdmin 
        ? await prepareAdminExportData(options)  // Admin can export all data
        : await prepareExportData(options);      // Regular users export only their data
      
      setSummary(summary);
      
      // Generate filename based on export type
      let filename = "cs-skin-vault";
      switch (exportType) {
        case "inventory":
          filename += "-inventory";
          break;
        case "transactions":
          filename += "-transactions";
          break;
        case "financial":
          filename += "-financial";
          break;
        case "all":
          filename += "-complete";
          break;
      }
      
      // Add admin prefix for admin exports
      if (isAdmin) {
        filename = "admin-" + filename;
      }
      
      downloadData(data, exportFormat, filename);
      
      toast({
        title: "Export Successful",
        description: `Your data has been exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Download your inventory and transaction data
            </CardDescription>
          </div>
          {isAdmin && (
            <div className="flex items-center text-sm bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded-md">
              <UserCheck className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
              <span>Admin Export</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="options" className="w-full">
          <TabsList>
            <TabsTrigger value="options">Export Options</TabsTrigger>
            <TabsTrigger value="summary" disabled={!summary}>Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="options" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="export-type">What would you like to export?</Label>
                <Select 
                  value={exportType} 
                  onValueChange={(value) => setExportType(value as ExportDataType)}
                >
                  <SelectTrigger id="export-type" className="w-full mt-1">
                    <SelectValue placeholder="Select export type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Complete Export (All Data)</SelectItem>
                    <SelectItem value="inventory">Active Inventory Only</SelectItem>
                    <SelectItem value="transactions">Transactions History Only</SelectItem>
                    <SelectItem value="financial">Financial Summary Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <Select 
                  value={exportFormat} 
                  onValueChange={(value) => setExportFormat(value as "json" | "csv")}
                >
                  <SelectTrigger id="export-format" className="w-full mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (Recommended)</SelectItem>
                    <SelectItem value="csv">CSV (For Excel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-details"
                  checked={includeDetails}
                  onCheckedChange={setIncludeDetails}
                />
                <Label htmlFor="include-details">Include detailed information</Label>
              </div>
              
              {isAdmin && (
                <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-md border border-amber-200 dark:border-amber-800 mt-4">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    Admin Export Mode Active
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                    You will export data for all users. Use this functionality responsibly.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            {summary && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card rounded-lg p-4 border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Inventory</h3>
                    <div className="text-2xl font-bold">{summary.activeSkins}</div>
                    <div className="text-sm text-muted-foreground">Active Skins</div>
                    <div className="text-lg font-medium mt-2">
                      {formatCurrency(summary.totalValue, currency.code)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                  
                  <div className="bg-card rounded-lg p-4 border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Transactions</h3>
                    <div className="text-2xl font-bold">{summary.transactionCount}</div>
                    <div className="text-sm text-muted-foreground">Total Transactions</div>
                    <div className={`text-lg font-medium mt-2 ${summary.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(summary.netProfit, currency.code)}
                    </div>
                    <div className="text-sm text-muted-foreground">Net Profit/Loss</div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mt-4">
                  Export generated on {new Date(summary.exportDate).toLocaleString()}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleExport}
          disabled={isLoading}
          className="flex items-center"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : exportFormat === "json" ? (
            <FileJson className="mr-2 h-4 w-4" />
          ) : (
            <FileSpreadsheet className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Preparing Export..." : "Download Data"}
        </Button>
      </CardFooter>
    </Card>
  );
};
