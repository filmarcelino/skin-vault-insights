
import { StatsCard } from "@/components/dashboard/stats-card";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { InventoryListItem } from "@/components/dashboard/inventory-list-item";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { ArrowUp, Boxes, DollarSign, ArrowDown, ArrowRightLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { useSkins } from "@/hooks/use-skins";
import { InventoryItem, Skin, SellData, Transaction } from "@/types/skin";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Loading } from "@/components/ui/loading";
import { InventorySkinModal } from "@/components/skins/inventory-skin-modal";
import { useToast } from "@/hooks/use-toast";
import { 
  getUserInventory, 
  getUserTransactions, 
  calculateInventoryValue, 
  findMostValuableSkin,
  sellSkin,
  addSkinToInventory
} from "@/services/inventory-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewToggle } from "@/components/ui/view-toggle";

interface IndexProps {
  activeTab?: "inventory" | "search";
}

const Index = ({ activeTab = "inventory" }: IndexProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [selectedSkin, setSelectedSkin] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"inventory" | "search">(activeTab);
  const [userInventory, setUserInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalSkins: 0,
    totalValue: "$0",
    mostValuable: {
      weapon: "None",
      skin: "None",
      price: "$0",
      image: undefined as string | undefined
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { toast } = useToast();
  
  const { data: skins, isLoading: isSkinsLoading, error: skinsError } = useSkins({
    search: searchQuery.length > 2 ? searchQuery : undefined,
    onlyUserInventory: currentTab === "inventory"
  });

  const refreshUserData = async () => {
    setIsLoading(true);
    try {
      console.log("Refreshing user data...");
      const loadedInventory = await getUserInventory();
      console.log("Loaded inventory:", loadedInventory);
      setUserInventory(loadedInventory || []);
      
      const loadedTransactions = await getUserTransactions();
      setTransactions(loadedTransactions || []);

      await prepareStats(loadedInventory);
    } catch (error) {
      console.error("Error refreshing user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (currentTab === "inventory") {
      setDebugInfo(`Loaded ${userInventory.length} skins from user inventory`);
    } else if (skins) {
      setDebugInfo(`Loaded ${skins.length} skins from search`);
    } else if (isSkinsLoading) {
      setDebugInfo("Loading skins...");
    } else if (skinsError) {
      setDebugInfo(`Error: ${skinsError.toString()}`);
    }
  }, [skins, isSkinsLoading, skinsError, userInventory, currentTab]);

  const prepareStats = async (inventory?: InventoryItem[]) => {
    try {
      // Use passed inventory if available, otherwise use the state
      const inventoryToUse = inventory || userInventory;
      
      // Calculate the total number of skins directly from the inventory array
      const totalSkins = inventoryToUse.length;
      console.log("Total skins in inventory:", totalSkins);
      
      const totalValue = await calculateInventoryValue();
      const mostValuableSkin = await findMostValuableSkin();

      setInventoryStats({
        totalSkins,
        totalValue: `$${totalValue.toLocaleString()}`,
        mostValuable: mostValuableSkin ? {
          weapon: mostValuableSkin.weapon || "Unknown",
          skin: mostValuableSkin.name,
          price: mostValuableSkin.currentPrice || mostValuableSkin.price ? 
            `$${(mostValuableSkin.currentPrice || mostValuableSkin.price || 0).toLocaleString()}` : "$0",
          image: mostValuableSkin.image
        } : {
          weapon: "None",
          skin: "None",
          price: "$0",
          image: undefined
        }
      });
    } catch (error) {
      console.error("Error preparing stats:", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSkinClick = (skin: Skin | InventoryItem) => {
    if ('isInUserInventory' in skin && skin.isInUserInventory) {
      setSelectedSkin(skin);
      setDetailModalOpen(true);
      return;
    }
    
    const inventorySkin: InventoryItem = {
      ...skin,
      inventoryId: `demo-${skin.id}`,
      acquiredDate: new Date().toISOString(),
      purchasePrice: skin.price || 0,
      currentPrice: skin.price,
      tradeLockDays: 0,
      isStatTrak: false,
      isInUserInventory: false
    };
    
    setSelectedSkin(inventorySkin);
    setDetailModalOpen(true);
  };

  const handleAddToInventory = async (skin: Skin) => {
    try {
      console.log("Adding skin to inventory:", skin);
      const newItem = await addSkinToInventory(skin, {
        purchasePrice: skin.price || 0,
        marketplace: "Steam Market",
        feePercentage: 13,
        notes: "Added from search"
      });
      
      await refreshUserData();
      
      toast({
        title: "Skin Added",
        description: `${skin.weapon} | ${skin.name} was added to your inventory.`,
      });
      
      return newItem;
    } catch (err) {
      console.error("Error adding skin:", err);
      toast({
        title: "Error",
        description: "Failed to add skin to inventory",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSellSkin = async (itemId: string, sellData: SellData) => {
    console.log("Selling skin:", itemId, sellData);
    
    try {
      await sellSkin(itemId, {
        soldPrice: sellData.soldPrice,
        soldMarketplace: sellData.soldMarketplace,
        soldFeePercentage: sellData.soldFeePercentage,
        soldNotes: sellData.soldNotes
      });
      
      await refreshUserData();
      
      toast({
        title: "Skin Sold",
        description: `The skin was successfully marked as sold for $${sellData.soldPrice}.`,
      });
      
      setDetailModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to sell the skin",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Search 
          placeholder="Search for weapon, skin or rarity..." 
          onChange={handleSearchChange}
          value={searchQuery}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <ViewToggle 
            view={viewMode}
            onChange={setViewMode}
          />
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "inventory" | "search")} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="inventory">My Inventory</TabsTrigger>
              <TabsTrigger value="search">Search Skins</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {skinsError && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
          Error loading skin data. Please try again later.
        </div>
      )}

      <div className="p-2 mb-4 bg-gray-100 dark:bg-gray-800 text-xs overflow-x-auto">
        <p>{debugInfo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
        <StatsCard 
          title="Total Skins" 
          value={isLoading && currentTab === "inventory" ? "Loading..." : inventoryStats.totalSkins} 
          icon={<Boxes className="h-5 w-5" />}
          className="animate-fade-in" 
          style={{ animationDelay: "0.1s" }}
        />
        <StatsCard 
          title="Total Value" 
          value={isLoading && currentTab === "inventory" ? "Loading..." : inventoryStats.totalValue} 
          icon={<DollarSign className="h-5 w-5" />} 
          className="animate-fade-in" 
          style={{ animationDelay: "0.2s" }}
        />
        <StatsCard 
          title="Most Valuable" 
          value={isLoading && currentTab === "inventory" ? "Loading..." : `${inventoryStats.mostValuable.weapon} | ${inventoryStats.mostValuable.skin}`} 
          className="md:col-span-1 animate-fade-in" 
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      
      {currentTab === "inventory" && userInventory.length > 0 && (
        <InsightsCard 
          message={`Your inventory has ${userInventory.length} skins worth ${inventoryStats.totalValue}`}
          className="mt-6 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
          id="inventory-summary"
        />
      )}
      
      <div className="mt-8">
        {currentTab === "inventory" && (
          <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Inventory</h2>
              <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10">
                Sort by Value
              </Button>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className="cs-card p-2">
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                      <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                      <div className="flex justify-between mt-1">
                        <div className="h-2.5 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-2.5 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : userInventory.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>Your inventory is empty.</p>
                    <p className="mt-2">Switch to "Search Skins" tab to find and add skins to your inventory.</p>
                  </div>
                ) : (
                  userInventory.map((skin, index) => (
                    <InventoryCard 
                      key={skin.inventoryId}
                      weaponName={skin.weapon || "Unknown"}
                      skinName={skin.name}
                      wear={skin.wear || skin.rarity || "Unknown"}
                      price={skin.currentPrice?.toString() || skin.price?.toString() || "N/A"}
                      image={skin.image}
                      rarity={skin.rarity}
                      isStatTrak={skin.isStatTrak}
                      tradeLockDays={skin.tradeLockDays}
                      tradeLockUntil={skin.tradeLockUntil}
                      className="animate-fade-in hover:scale-105 transition-transform duration-200"
                      style={{ animationDelay: `${0.5 + (index * 0.05)}s` }}
                      onClick={() => handleSkinClick(skin)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 border rounded-md divide-y divide-border/50">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, idx) => (
                    <div key={`skeleton-list-${idx}`} className="p-3 flex items-center gap-3">
                      <Skeleton className="h-12 w-12 shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-12 shrink-0" />
                    </div>
                  ))
                ) : userInventory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Your inventory is empty.</p>
                    <p className="mt-2">Switch to "Search Skins" tab to find and add skins to your inventory.</p>
                  </div>
                ) : (
                  userInventory.map((skin, index) => (
                    <InventoryListItem 
                      key={skin.inventoryId}
                      weaponName={skin.weapon || "Unknown"}
                      skinName={skin.name}
                      wear={skin.wear || skin.rarity || "Unknown"}
                      price={skin.currentPrice?.toString() || skin.price?.toString() || "N/A"}
                      image={skin.image}
                      rarity={skin.rarity}
                      isStatTrak={skin.isStatTrak}
                      tradeLockDays={skin.tradeLockDays}
                      tradeLockUntil={skin.tradeLockUntil}
                      className="animate-fade-in"
                      style={{ animationDelay: `${0.5 + (index * 0.05)}s` }}
                      onClick={() => handleSkinClick(skin)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
        
        {currentTab === 'search' && (
          <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Search Results</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Filter
              </Button>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {isSkinsLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="cs-card p-2 flex flex-col">
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="w-full h-16 mb-1" />
                      <div className="flex items-center justify-between mt-auto">
                        <Skeleton className="h-2.5 w-12" />
                        <Skeleton className="h-2.5 w-10" />
                      </div>
                    </div>
                  ))
                ) : skins && skins.length > 0 ? (
                  skins.map((skin, index) => (
                    <InventoryCard 
                      key={skin.id}
                      weaponName={skin.weapon || "Unknown"}
                      skinName={skin.name}
                      wear={skin.wear || skin.rarity || "Unknown"}
                      price={skin.price?.toString() || "N/A"}
                      image={skin.image}
                      rarity={skin.rarity}
                      isStatTrak={Math.random() > 0.7}
                      tradeLockDays={0}
                      className="animate-fade-in hover:scale-105 transition-transform duration-200"
                      style={{ animationDelay: `${0.5 + (index * 0.05)}s` }}
                      onClick={() => handleSkinClick(skin)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {searchQuery.length > 0 ? (
                      <>No skins found matching "{searchQuery}". Try adjusting your search.</>
                    ) : (
                      <>Enter a search term to find skins.</>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 border rounded-md divide-y divide-border/50">
                {isSkinsLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <div key={`skeleton-list-search-${index}`} className="p-3 flex items-center gap-3">
                      <Skeleton className="h-12 w-12 shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-12 shrink-0" />
                    </div>
                  ))
                ) : skins && skins.length > 0 ? (
                  skins.map((skin, index) => (
                    <InventoryListItem 
                      key={skin.id}
                      weaponName={skin.weapon || "Unknown"}
                      skinName={skin.name}
                      wear={skin.wear || skin.rarity || "Unknown"}
                      price={skin.price?.toString() || "N/A"}
                      image={skin.image}
                      rarity={skin.rarity}
                      isStatTrak={Math.random() > 0.7}
                      tradeLockDays={0}
                      className="animate-fade-in"
                      style={{ animationDelay: `${0.5 + (index * 0.05)}s` }}
                      onClick={() => handleSkinClick(skin)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery.length > 0 ? (
                      <>No skins found matching "{searchQuery}". Try adjusting your search.</>
                    ) : (
                      <>Enter a search term to find skins.</>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.9s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
          </Button>
        </div>
        
        <div className="cs-card divide-y divide-border/50">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={`trans-skeleton-${idx}`} className={`p-4 flex items-center gap-3`}>
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : transactions.length > 0 ? (
            transactions.slice(0, 5).map((item, index) => (
              <ActivityItem 
                key={item.id}
                type={item.type}
                weaponName={item.weaponName}
                skinName={item.skinName}
                date={item.date}
                price={item.price?.toString()}
                icon={
                  item.type === 'add' ? <ArrowUp className="h-4 w-4" /> :
                  item.type === 'sell' ? <ArrowDown className="h-4 w-4" /> :
                  item.type === 'trade' ? <ArrowRightLeft className="h-4 w-4" /> :
                  <ShoppingCart className="h-4 w-4" />
                }
                className={`${index === 0 ? "pt-0" : ""} hover:bg-secondary/30 transition-colors`}
              />
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No transaction history yet. Add skins to your inventory to see activity here.
            </div>
          )}
        </div>
      </div>

      <InventorySkinModal
        item={selectedSkin}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onSellSkin={handleSellSkin}
        onAddToInventory={handleAddToInventory}
      />
    </>
  );
};

export default Index;
