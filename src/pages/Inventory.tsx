
import { useState } from "react";
import { useInventory } from "@/hooks/use-skins";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { SoldSkinsTable } from "@/components/inventory/SoldSkinsTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, List, Ban, PackageOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InventoryFilterBar } from "@/components/dashboard/InventoryFilterBar";
import { useInventoryFilter } from "@/hooks/useInventoryFilter";
import { useViewMode } from "@/hooks/useViewMode";
import { useRealTimeInventory } from "@/hooks/useRealTimeInventory";
import { useLanguage } from "@/contexts/LanguageContext";
import { ViewToggle } from "@/components/ui/view-toggle";
import { Link } from "react-router-dom";

const Inventory = () => {
  const { viewMode, setViewMode, toggleViewMode } = useViewMode();
  const [activeTab, setActiveTab] = useState("current");
  const { data: inventory, isLoading, error } = useInventory();
  const { t } = useLanguage();
  
  // Enable real-time inventory updates
  useRealTimeInventory();

  // Initialize the inventory filter hook with the inventory data
  const { 
    inventoryFilters, 
    filterInventoryItems, 
    clearFilters, 
    updateFilter 
  } = useInventoryFilter(inventory || []);
  
  // Filter inventory items based on current filters
  const filteredItems = inventory ? filterInventoryItems(inventory) : [];
  
  // Count items for badges
  const currentCount = inventory?.filter(item => item.is_in_user_inventory).length || 0;
  const soldCount = inventory?.filter(item => !item.is_in_user_inventory).length || 0;

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
            {t('inventory.current')}
            <span className="ml-2 bg-secondary rounded-full px-2 py-0.5 text-xs">
              {currentCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="sold">
            <Ban className="mr-2 h-4 w-4" />
            {t('inventory.sold')}
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
            </Card>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <InventoryGrid items={filteredItems.filter(item => item.is_in_user_inventory)} />
              ) : (
                <InventoryTable items={filteredItems.filter(item => item.is_in_user_inventory)} />
              )}
              {filteredItems.filter(item => item.is_in_user_inventory).length === 0 && (
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
            items={inventory?.filter(item => !item.is_in_user_inventory) || []} 
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
