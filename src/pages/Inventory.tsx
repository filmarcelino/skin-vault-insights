
import { useState } from "react";
import { useInventory } from "@/hooks/use-skins";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { SoldSkinsTable } from "@/components/inventory/SoldSkinsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ban, PackageOpen } from "lucide-react";
import { InventoryFilterBar } from "@/components/dashboard/InventoryFilterBar";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { useInventoryFilter } from "@/hooks/useInventoryFilter";
import { useViewMode } from "@/hooks/useViewMode";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { InventorySkinModal } from "@/components/skins/inventory-skin-modal";
import { useInventoryActions } from "@/hooks/useInventoryActions";
import { defaultInventoryItem } from "@/utils/default-objects";
import { InventoryItem, SellData } from "@/types/skin";
import { Loading } from "@/components/ui/loading";
import { SkinDetailModal } from "@/components/skins/skin-detail-modal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchSoldItems } from "@/services/inventory";

export default function Inventory() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("current");
  const { viewMode, setViewMode } = useViewMode("grid"); 
  
  const { 
    data: inventoryData = [], 
    isLoading, 
    error, 
    isFetching 
  } = useInventory();
  
  // Type cast inventory data to InventoryItem[] to satisfy TypeScript
  const inventory = inventoryData as InventoryItem[];
  
  // Fetch sold items with a separate query
  const { 
    data: soldItemsData = [], 
    isLoading: isSoldItemsLoading,
    refetch: refetchSoldItems
  } = useQuery({
    queryKey: ["sold-items"],
    queryFn: fetchSoldItems,
    // Ensure we always get fresh data
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });
  
  // Type cast sold items to InventoryItem[]
  const soldItems = soldItemsData as InventoryItem[];
  
  console.log("Current inventory items:", Array.isArray(inventory) ? inventory.length : 0);
  console.log("Sold items:", Array.isArray(soldItems) ? soldItems.length : 0);
  
  const { 
    searchQuery, 
    setSearchQuery, 
    weaponFilter, 
    setWeaponFilter, 
    rarityFilter, 
    setRarityFilter, 
    sortMethod, 
    setSortMethod,
    updateFilter
  } = useInventoryFilter(inventory);
  
  // Apply filters to get the filtered items
  const filteredItems = Array.isArray(inventory) ? inventory.filter(item => {
    // Apply search filter
    if (searchQuery && !item.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.weapon?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply weapon filter
    if (weaponFilter !== "all" && item.weapon !== weaponFilter) {
      return false;
    }
    
    // Apply rarity filter
    if (rarityFilter !== "all" && item.rarity !== rarityFilter) {
      return false;
    }
    
    return true;
  }) : [];
  
  const { 
    selectedItem, 
    isModalOpen,
    isDetailModalOpen,
    modalMode,
    setIsModalOpen,
    setIsDetailModalOpen,
    handleViewDetails,
    handleEditItem,
    handleDeleteItem,
    handleMarkAsSold,
    handleSellItem,
    handleDuplicate,
    handleClose,
    handleCloseDetail
  } = useInventoryActions();
  
  const currentCount = Array.isArray(inventory) ? inventory.length : 0;
  const soldCount = Array.isArray(soldItems) ? soldItems.length : 0;

  // Enhanced handler to refetch sold items after marking item as sold
  const handleItemSell = async (itemId: string, sellData: SellData): Promise<void> => {
    console.log("Inventory page: handling sell item request", { itemId, sellData });
    await handleMarkAsSold(itemId, sellData);
    
    // Force refetch sold items to update the list
    console.log("Sale processed, refetching sold items");
    await refetchSoldItems();
  };
  
  if (isLoading) {
    return (
      <Loading />
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-500">
          {t("errors.loadingError")}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t("errors.tryAgain")}
        </p>
        <Button 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          {t("common.refresh")}
        </Button>
      </div>
    );
  }
  
  // Create filters array for InventoryFilterBar
  const filters = [
    { id: "search", label: t("filters.search"), value: searchQuery },
    { id: "weapon", label: t("filters.weapon"), value: weaponFilter },
    { id: "rarity", label: t("filters.rarity"), value: rarityFilter },
    { id: "sort", label: t("filters.sort"), value: sortMethod }
  ];
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {t("inventory.title")}
        </h2>
        <Button onClick={() => navigate("/add")}>
          {t("inventory.add")}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">
            <PackageOpen className="mr-2 h-4 w-4" />
            {t("inventory.current")}
            <span className="ml-2 bg-secondary rounded-full px-2 py-0.5 text-xs">
              {currentCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="sold">
            <Ban className="mr-2 h-4 w-4" />
            {t("inventory.sold")}
            <span className="ml-2 bg-secondary rounded-full px-2 py-0.5 text-xs">
              {soldCount}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <InventoryFilterBar 
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={() => {
              setSearchQuery("");
              setWeaponFilter("all");
              setRarityFilter("all");
              setSortMethod("price_desc");
            }}
          />
        </div>
        
        <TabsContent value="current" className="mt-4">
          {currentCount === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium">
                {t("inventory.empty")}
              </h3>
              <p className="text-muted-foreground mt-2 mb-4">
                {t("inventory.emptyDesc")}
              </p>
              <Button onClick={() => navigate("/add")}>
                {t("inventory.add")}
              </Button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="text-lg font-medium">
                {t("search.noResults")}
              </h3>
              <p className="text-muted-foreground mt-2">
                {t("search.tryDifferent")}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <InventoryGrid 
              items={filteredItems}
              onViewDetails={handleViewDetails}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onSell={handleSellItem}
              onDuplicate={handleDuplicate}
            />
          ) : (
            <InventoryTable 
              items={filteredItems}
              onViewDetails={handleViewDetails}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onSell={handleItemSell}
              onDuplicate={handleDuplicate}
            />
          )}
        </TabsContent>
        
        <TabsContent value="sold" className="mt-4">
          {isSoldItemsLoading ? (
            <Loading />
          ) : soldCount === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium">
                {t("inventory.noSoldItems")}
              </h3>
              <p className="text-muted-foreground mt-2">
                {t("inventory.sellItemsDesc")}
              </p>
            </div>
          ) : (
            <SoldSkinsTable items={soldItems} />
          )}
        </TabsContent>
      </Tabs>
      
      {/* Inventory Item Edit/Sell Modal */}
      <InventorySkinModal 
        open={isModalOpen}
        onOpenChange={handleClose}
        skin={selectedItem || defaultInventoryItem} 
        mode={modalMode}
      />
      
      {/* Skin Detail View Modal */}
      <SkinDetailModal 
        open={isDetailModalOpen}
        onOpenChange={handleCloseDetail}
        skin={selectedItem || defaultInventoryItem}
      />
    </>
  );
}
