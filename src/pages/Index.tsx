
import { StatsCard } from "@/components/dashboard/stats-card";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { InventoryCard } from "@/components/dashboard/inventory-card";
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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [selectedSkin, setSelectedSkin] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [userInventory, setUserInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const { toast } = useToast();
  
  // Fetch skins data from the API
  const { data: skins, isLoading, error } = useSkins({
    search: searchQuery.length > 2 ? searchQuery : undefined,
    onlyUserInventory: activeTab === "inventory"
  });

  // Load user inventory and transactions
  useEffect(() => {
    const loadedInventory = getUserInventory();
    setUserInventory(loadedInventory);
    
    const loadedTransactions = getUserTransactions();
    setTransactions(loadedTransactions);
  }, []);

  // Debug information
  useEffect(() => {
    if (activeTab === "inventory") {
      setDebugInfo(`Loaded ${userInventory.length} skins from user inventory`);
    } else if (skins) {
      setDebugInfo(`Loaded ${skins.length} skins from search`);
    } else if (isLoading) {
      setDebugInfo("Loading skins...");
    } else if (error) {
      setDebugInfo(`Error: ${error.toString()}`);
    }
  }, [skins, isLoading, error, userInventory, activeTab]);

  // Prepare stats from the fetched data
  const prepareStats = () => {
    const totalSkins = userInventory.length;
    const totalValue = calculateInventoryValue();
    const mostValuableSkin = findMostValuableSkin();

    return {
      totalSkins,
      totalValue: `$${totalValue.toLocaleString()}`,
      mostValuable: mostValuableSkin ? {
        weapon: mostValuableSkin.weapon || "Unknown",
        skin: mostValuableSkin.name,
        price: mostValuableSkin.currentPrice || mostValuableSkin.price ? 
          `$${(mostValuableSkin.currentPrice || mostValuableSkin.price || 0).toLocaleString()}` : "$0"
      } : {
        weapon: "None",
        skin: "None",
        price: "$0"
      }
    };
  };

  const stats = prepareStats();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle clicking on a skin to view details
  const handleSkinClick = (skin: Skin | InventoryItem) => {
    // If the skin is already in the inventory, use it directly
    if ('isInUserInventory' in skin && skin.isInUserInventory) {
      setSelectedSkin(skin);
      setDetailModalOpen(true);
      return;
    }
    
    // Add some mock inventory data to the skin for display purposes
    const inventorySkin: InventoryItem = {
      ...skin,
      inventoryId: `demo-${skin.id}`,
      acquiredDate: new Date().toISOString(),
      purchasePrice: skin.price ? skin.price * 0.9 : 0, // Mock purchase price
      currentPrice: skin.price,
      tradeLockDays: Math.floor(Math.random() * 8), // Random trade lock between 0-7 days
      tradeLockUntil: new Date(new Date().getTime() + Math.floor(Math.random() * 8) * 24 * 60 * 60 * 1000).toISOString(),
      isStatTrak: Math.random() > 0.7, // 30% chance of being StatTrak
      marketplace: "Steam Market",
      feePercentage: 13,
      notes: "This is a mock inventory item for demonstration purposes.",
      isInUserInventory: false // Mark as not in inventory
    };
    
    setSelectedSkin(inventorySkin);
    setDetailModalOpen(true);
  };

  // Add skin to user's inventory
  const handleAddToInventory = (skin: Skin) => {
    try {
      const newItem = addSkinToInventory(skin, {
        purchasePrice: skin.price || 0,
        marketplace: "Steam Market",
        feePercentage: 13,
        notes: "Added from search"
      });
      
      // Refresh inventory
      setUserInventory([...getUserInventory()]);
      setTransactions([...getUserTransactions()]);
      
      toast({
        title: "Skin Added",
        description: `${skin.weapon} | ${skin.name} was added to your inventory.`,
      });
      
      return newItem;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add skin to inventory",
        variant: "destructive"
      });
      return null;
    }
  };

  // Handle selling a skin
  const handleSellSkin = (itemId: string, sellData: SellData) => {
    console.log("Selling skin:", itemId, sellData);
    
    try {
      sellSkin(itemId, {
        soldPrice: sellData.soldPrice,
        soldMarketplace: sellData.soldMarketplace,
        soldFeePercentage: sellData.soldFeePercentage,
        soldNotes: sellData.soldNotes
      });
      
      // Refresh inventory and transactions
      setUserInventory([...getUserInventory()]);
      setTransactions([...getUserTransactions()]);
      
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="inventory">My Inventory</TabsTrigger>
            <TabsTrigger value="search">Search Skins</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
          Error loading skin data. Please try again later.
        </div>
      )}

      {/* Debug info - only visible during development */}
      <div className="p-2 mb-4 bg-gray-100 dark:bg-gray-800 text-xs overflow-x-auto">
        <p>{debugInfo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
        <StatsCard 
          title="Total Skins" 
          value={isLoading && activeTab === "inventory" ? "Loading..." : stats.totalSkins} 
          icon={<Boxes className="h-5 w-5" />}
          className="animate-fade-in" 
          style={{ animationDelay: "0.1s" }}
        />
        <StatsCard 
          title="Total Value" 
          value={isLoading && activeTab === "inventory" ? "Loading..." : stats.totalValue} 
          icon={<DollarSign className="h-5 w-5" />} 
          className="animate-fade-in" 
          style={{ animationDelay: "0.2s" }}
        />
        <StatsCard 
          title="Most Valuable" 
          value={isLoading && activeTab === "inventory" ? "Loading..." : `${stats.mostValuable.weapon} | ${stats.mostValuable.skin}`} 
          className="md:col-span-1 animate-fade-in" 
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      
      {activeTab === "inventory" && userInventory.length > 0 && (
        <InsightsCard 
          message={`Your inventory has ${userInventory.length} skins worth ${stats.totalValue}`}
          className="mt-6 animate-fade-in animate-pulse-glow"
          style={{ animationDelay: "0.4s" }}
        />
      )}
      
      <Tabs defaultValue={activeTab} value={activeTab}>
        <TabsContent value="inventory" className="mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">My Inventory</h2>
            <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10">
              Sort by Value
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userInventory.length === 0 ? (
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
                  style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
                  onClick={() => handleSkinClick(skin)}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="search" className="mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Search Results</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Filter
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              // Show skeletons while loading
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="cs-card p-3 flex flex-col">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="w-full h-24 mb-2" />
                  <div className="flex items-center justify-between mt-auto">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))
            ) : skins && skins.length > 0 ? (
              // Display the fetched skins
              skins.map((skin, index) => (
                <InventoryCard 
                  key={skin.id}
                  weaponName={skin.weapon || "Unknown"}
                  skinName={skin.name}
                  wear={skin.wear || skin.rarity || "Unknown"}
                  price={skin.price?.toString() || "N/A"}
                  image={skin.image}
                  rarity={skin.rarity}
                  isStatTrak={Math.random() > 0.7} // 30% chance of being StatTrak for demo
                  tradeLockDays={0}
                  className="animate-fade-in hover:scale-105 transition-transform duration-200"
                  style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
                  onClick={() => handleSkinClick(skin)}
                />
              ))
            ) : (
              // Display a message when no skins are found
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {searchQuery.length > 0 ? (
                  <>No skins found matching "{searchQuery}". Try adjusting your search.</>
                ) : (
                  <>Enter a search term to find skins.</>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.9s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
          </Button>
        </div>
        
        <div className="cs-card divide-y divide-border/50">
          {transactions.length > 0 ? (
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

      {/* Inventory Skin Modal */}
      <InventorySkinModal
        item={selectedSkin}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onSellSkin={handleSellSkin}
        onAddToInventory={!selectedSkin?.isInUserInventory ? handleAddToInventory : undefined}
      />
    </>
  );
};

export default Index;
