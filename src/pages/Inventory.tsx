import { useState } from "react";
import { useInventory } from "@/hooks/use-skins";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { SoldSkinsTable } from "@/components/inventory/SoldSkinsTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageOpen, Ban } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InventoryFilterBar } from "@/components/dashboard/InventoryFilterBar";
import { useInventoryFilter } from "@/hooks/useInventoryFilter";
import { useViewMode } from "@/hooks/useViewMode";
import { useRealTimeInventory } from "@/hooks/useRealTimeInventory";
import { useLanguage } from "@/contexts/LanguageContext";
import { ViewToggle } from "@/components/ui/view-toggle";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { debugInventoryItem } from "@/services/inventory";

const Inventory = () => {
  const { viewMode, setViewMode } = useViewMode();
  const [activeTab, setActiveTab] = useState("current");
  const { data: inventory, isLoading, error } = useInventory();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Enable real-time inventory updates
  useRealTimeInventory();

  // Debug inventory data
  console.log("Raw inventory data:", inventory);
  if (inventory && inventory.length > 0) {
    console.log("First item in inventory:", inventory[0]);
    // Use helper function to debug inventory item properties
    debugInventoryItem(inventory[0], "First inventory item");
  }

  // Initialize the inventory filter hook with the inventory data
  const { 
    inventoryFilters, 
    filterInventoryItems, 
    clearFilters, 
    updateFilter 
  } = useInventoryFilter(inventory || []);
  
  // Ensure inventory items are valid before filtering
  const validInventory = inventory?.filter(item => {
    const isValid = item && typeof item === 'object' && 'inventoryId' in item;
    if (!isValid) console.warn("Invalid inventory item detected:", item);
    return isValid;
  }) || [];
  
  // Filter inventory items based on current filters
  const filteredItems = filterInventoryItems(validInventory);
  
  // Count items for badges - ensure safe type checking
  const currentItems = validInventory.filter(item => item.isInUserInventory === true);
  const soldItems = validInventory.filter(item => item.isInUserInventory === false);
  
  // Item counts
  const currentCount = currentItems.length;
  const soldCount = soldItems.length;

  // Show toast if there's an error
  if (error && !isLoading) {
    toast({
      title: t('errors.loadFailed'),
      description: t('errors.tryAgain'),
      variant: "destructive"
    });
    console.error("Inventory loading error:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {t('dashboard.inventory')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.inventoryDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Ensure filters prop is never undefined */}
      <InventoryFilterBar 
        filters={inventoryFilters || []}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />
      
      <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">
            <PackageOpen className="mr-2 h-4 w-4" />
            Current Inventory
            <span className="ml-2 bg-secondary rounded-full px-2 py-0.5 text-xs">
              {currentCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="sold">
            <Ban className="mr-2 h-4 w-4" />
            Sold Skins
            <span className="ml-2 bg-secondary rounded-full px-2 py-0.5 text-xs">
              {soldCount}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('errors.loadFailed')}</CardTitle>
                <CardDescription>{t('errors.tryAgain')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  {t('inventory.noItems')}
                </div>
                <Button onClick={() => window.location.reload()} variant="outline">
                  {t('common.refresh')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <InventoryGrid items={currentItems} />
              ) : (
                <InventoryTable items={currentItems} />
              )}
              {currentItems.length === 0 && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>{t('inventory.noItems')}</CardTitle>
                    <CardDescription>
                      {inventoryFilters.some(f => f.value !== '') ? 
                        t('inventory.noFilterResults') : 
                        t('inventory.emptyInventory')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {inventoryFilters.some(f => f.value !== '') ? (
                      <Button onClick={clearFilters} variant="outline">
                        {t('filters.clearAll')}
                      </Button>
                    ) : (
                      <Button variant="default" asChild>
                        <Link to="/search">{t('inventory.browseItems')}</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="sold">
          <SoldSkinsTable 
            items={soldItems} 
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
