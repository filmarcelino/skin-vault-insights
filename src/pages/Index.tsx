
import React, { useState, useEffect } from "react";
import { Search } from "@/components/ui/search";
import { useSkins } from "@/hooks/use-skins";
import { InventoryItem, Skin, SellData } from "@/types/skin";
import { useToast } from "@/hooks/use-toast";
import { InventorySkinModal } from "@/components/skins/inventory-skin-modal";
import { 
  getUserInventory, 
  getUserTransactions, 
  calculateInventoryValue, 
  findMostValuableSkin,
  sellSkin,
  addSkinToInventory
} from "@/services/inventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewToggle } from "@/components/ui/view-toggle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatsSection } from "@/components/dashboard/stats-section";
import { InventorySection } from "@/components/dashboard/inventory-section";
import { SearchSection } from "@/components/dashboard/search-section";
import { ActivitySection } from "@/components/dashboard/activity-section";
import { PremiumCTA } from "@/components/dashboard/premium-cta";
import { useInventoryFilter } from "@/hooks/useInventoryFilter";
import { useViewMode } from "@/hooks/useViewMode";

interface IndexProps {
  activeTab?: "inventory" | "search";
}

const Index = ({ activeTab = "inventory" }: IndexProps) => {
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [selectedSkin, setSelectedSkin] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"inventory" | "search">(activeTab);
  const [userInventory, setUserInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState([]);
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  
  // Custom hooks
  const { viewMode, setViewMode } = useViewMode('grid');
  const {
    searchQuery,
    weaponFilter,
    rarityFilter,
    sortMethod,
    filteredInventory,
    handleSearchChange,
    setWeaponFilter,
    setRarityFilter,
    setSortMethod
  } = useInventoryFilter(userInventory);

  // Fetch skins based on search and filters
  const { data: skins, isLoading: isSkinsLoading, error: skinsError } = useSkins({
    search: searchQuery.length > 2 ? searchQuery : undefined,
    onlyUserInventory: currentTab === "inventory",
    weapon: weaponFilter || undefined,
    rarity: rarityFilter || undefined
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
    const checkSubscription = async () => {
      if (!session?.access_token) return;

      try {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) {
          console.error("Error checking subscription:", error);
          return;
        }

        setIsSubscribed(data?.subscribed || false);
      } catch (err) {
        console.error("Failed to check subscription status:", err);
      }
    };

    checkSubscription();
  }, [session]);

  useEffect(() => {
    refreshUserData();
  }, []);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (currentTab === "inventory") {
      setDebugInfo(`Loaded ${filteredInventory.length} skins from user inventory`);
    } else if (skins) {
      setDebugInfo(`Loaded ${skins.length} skins from search`);
    } else if (isSkinsLoading) {
      setDebugInfo("Loading skins...");
    } else if (skinsError) {
      setDebugInfo(`Error: ${skinsError.toString()}`);
    }
  }, [skins, isSkinsLoading, skinsError, filteredInventory, currentTab]);

  const prepareStats = async (inventory?: InventoryItem[]) => {
    try {
      const inventoryToUse = inventory || userInventory;
      
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

  const handleSkinClick = (skin: Skin | InventoryItem) => {
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

      <PremiumCTA isSubscribed={isSubscribed} />

      <StatsSection 
        isLoading={isLoading} 
        inventoryStats={inventoryStats} 
        currentTab={currentTab} 
      />
      
      <div className="mt-8">
        {currentTab === "inventory" && (
          <InventorySection 
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            weaponFilter={weaponFilter}
            setWeaponFilter={setWeaponFilter}
            rarityFilter={rarityFilter}
            setRarityFilter={setRarityFilter}
            sortMethod={sortMethod}
            setSortMethod={setSortMethod}
            viewMode={viewMode}
            isLoading={isLoading}
            filteredInventory={filteredInventory}
            userInventory={userInventory}
            inventoryStats={inventoryStats}
            handleSkinClick={handleSkinClick}
          />
        )}
        
        {currentTab === 'search' && (
          <SearchSection 
            viewMode={viewMode}
            isSkinsLoading={isSkinsLoading}
            skins={skins}
            searchQuery={searchQuery}
            handleSkinClick={handleSkinClick}
          />
        )}
      </div>
      
      <ActivitySection 
        isLoading={isLoading}
        transactions={transactions}
      />

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
