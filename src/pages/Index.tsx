
import { StatsCard } from "@/components/dashboard/stats-card";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { ArrowUp, Boxes, DollarSign, ArrowDown, ArrowRightLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/use-skins";
import { InventoryItem, SellData, Transaction } from "@/types/skin";
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
  sellSkin
} from "@/services/inventory-service";

const Index = () => {
  const [selectedSkin, setSelectedSkin] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [userInventory, setUserInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalSkins: 0,
    totalValue: "$0",
    mostValuable: {
      weapon: "None",
      skin: "None",
      price: "$0"
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  
  // Buscar dados do inventário usando o hook useInventory
  const { data: inventoryItems = [], isLoading: isInventoryLoading } = useInventory();

  // Carregar inventário do usuário e transações
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

  // Atualizar dados quando o inventário mudar
  useEffect(() => {
    if (inventoryItems && inventoryItems.length > 0) {
      setUserInventory(inventoryItems);
      prepareStats(inventoryItems);
    }
  }, [inventoryItems]);

  // Preparar estatísticas a partir dos dados buscados
  const prepareStats = async (inventory = userInventory) => {
    try {
      const totalSkins = inventory.length;
      const totalValue = await calculateInventoryValue();
      let mostValuableSkin;
      
      try {
        mostValuableSkin = await findMostValuableSkin();
      } catch (error) {
        console.error("Error finding most valuable skin:", error);
        mostValuableSkin = null;
      }

      setInventoryStats({
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
      });
    } catch (error) {
      console.error("Error preparing stats:", error);
    }
  };

  // Clicar em uma skin para ver detalhes
  const handleSkinClick = (skin: InventoryItem) => {
    setSelectedSkin(skin);
    setDetailModalOpen(true);
  };

  // Vender uma skin
  const handleSellSkin = async (itemId: string, sellData: SellData) => {
    console.log("Selling skin:", itemId, sellData);
    
    try {
      await sellSkin(itemId, {
        soldPrice: sellData.soldPrice,
        soldMarketplace: sellData.soldMarketplace,
        soldFeePercentage: sellData.soldFeePercentage,
        soldNotes: sellData.soldNotes
      });
      
      // Atualizar inventário e transações
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
        <StatsCard 
          title="Total Skins" 
          value={isLoading ? "Loading..." : inventoryStats.totalSkins} 
          icon={<Boxes className="h-5 w-5" />}
          className="animate-fade-in" 
          style={{ animationDelay: "0.1s" }}
        />
        <StatsCard 
          title="Total Value" 
          value={isLoading ? "Loading..." : inventoryStats.totalValue} 
          icon={<DollarSign className="h-5 w-5" />} 
          className="animate-fade-in" 
          style={{ animationDelay: "0.2s" }}
        />
        <StatsCard 
          title="Most Valuable" 
          value={isLoading ? "Loading..." : `${inventoryStats.mostValuable.weapon} | ${inventoryStats.mostValuable.skin}`} 
          className="md:col-span-1 animate-fade-in" 
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      
      {userInventory.length > 0 && (
        <InsightsCard 
          message={`Your inventory has ${userInventory.length} skins worth ${inventoryStats.totalValue}`}
          className="mt-6 animate-fade-in animate-pulse-glow"
          style={{ animationDelay: "0.4s" }}
        />
      )}
      
      <div className="mt-8">
        <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">My Inventory</h2>
            <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10">
              Sort by Value
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading || isInventoryLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="cs-card p-3">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="flex justify-between mt-2">
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : userInventory.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>Your inventory is empty.</p>
                <p className="mt-2">Go to "Add Skin" page to add skins to your inventory.</p>
              </div>
            ) : (
              // Display inventory items
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
        </div>
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
            // Loading skeletons for transactions
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

      {/* Inventory Skin Modal */}
      <InventorySkinModal
        item={selectedSkin}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onSellSkin={handleSellSkin}
      />
    </>
  );
};

export default Index;
