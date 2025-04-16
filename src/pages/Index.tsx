
import { StatsCard } from "@/components/dashboard/stats-card";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { ArrowUp, Boxes, DollarSign, ArrowDown, ArrowRightLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { useSkins } from "@/hooks/use-skins";
import { Skin } from "@/types/skin";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Loading } from "@/components/ui/loading";

// Activity data (in a real app, this would also come from an API)
const activityItems = [
  {
    type: "add" as const,
    weaponName: "AWP",
    skinName: "Desert Hydra",
    date: "Apr 20",
    price: "4,300",
    icon: <ArrowUp className="h-4 w-4" />
  },
  {
    type: "sell" as const,
    weaponName: "SSG 08",
    skinName: "Bloodshot",
    date: "Apr 17",
    price: "8.50",
    icon: <ArrowDown className="h-4 w-4" />
  },
  {
    type: "trade" as const,
    weaponName: "M4A1-S",
    skinName: "Cyrex",
    date: "Apr 15",
    icon: <ArrowRightLeft className="h-4 w-4" />
  },
  {
    type: "purchase" as const,
    weaponName: "Desert Eagle",
    skinName: "Printstream",
    date: "Apr 12",
    price: "55",
    icon: <ShoppingCart className="h-4 w-4" />
  }
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  
  // Fetch skins data from the API
  const { data: skins, isLoading, error } = useSkins({
    search: searchQuery.length > 2 ? searchQuery : undefined
  });

  // Debug information
  useEffect(() => {
    if (skins) {
      setDebugInfo(`Loaded ${skins.length} skins`);
    } else if (isLoading) {
      setDebugInfo("Loading skins...");
    } else if (error) {
      setDebugInfo(`Error: ${error.toString()}`);
    }
  }, [skins, isLoading, error]);

  // Function to calculate total inventory value
  const calculateTotalValue = (skins: Skin[]) => {
    return skins.reduce((total, skin) => {
      return total + (skin.price || 0);
    }, 0);
  };

  // Find the most valuable skin
  const findMostValuableSkin = (skins: Skin[]) => {
    if (!skins || skins.length === 0) return null;
    
    return skins.reduce((mostValuable, current) => {
      return (current.price || 0) > (mostValuable.price || 0) ? current : mostValuable;
    }, skins[0]);
  };

  // Prepare stats from the fetched data
  const prepareStats = () => {
    if (!skins || skins.length === 0) {
      return {
        totalSkins: 0,
        totalValue: "$0",
        mostValuable: {
          weapon: "None",
          skin: "None",
          price: "$0"
        }
      };
    }

    const totalValue = calculateTotalValue(skins);
    const mostValuableSkin = findMostValuableSkin(skins);

    return {
      totalSkins: skins.length,
      totalValue: `$${totalValue.toLocaleString()}`,
      mostValuable: mostValuableSkin ? {
        weapon: mostValuableSkin.weapon || "Unknown",
        skin: mostValuableSkin.name,
        price: mostValuableSkin.price ? `$${mostValuableSkin.price.toLocaleString()}` : "$0"
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

  return (
    <>
      <div className="mb-6">
        <Search 
          placeholder="Search for weapon, skin or rarity..." 
          onChange={handleSearchChange}
          value={searchQuery}
        />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <StatsCard 
          title="Total Skins" 
          value={isLoading ? "Loading..." : stats.totalSkins} 
          icon={<Boxes className="h-5 w-5" />}
          className="animate-fade-in" 
          style={{ animationDelay: "0.1s" }}
        />
        <StatsCard 
          title="Total Value" 
          value={isLoading ? "Loading..." : stats.totalValue} 
          icon={<DollarSign className="h-5 w-5" />} 
          className="animate-fade-in" 
          style={{ animationDelay: "0.2s" }}
        />
        <StatsCard 
          title="Most Valuable" 
          value={isLoading ? "Loading..." : `${stats.mostValuable.weapon} | ${stats.mostValuable.skin}`} 
          className="md:col-span-1 animate-fade-in" 
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      
      <InsightsCard 
        message="Your inventory has increased in value by 7.4% since last week" 
        className="mt-6 animate-fade-in animate-pulse-glow"
        style={{ animationDelay: "0.4s" }}
      />
      
      <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Inventory</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            skins.slice(0, 8).map((skin, index) => (
              <InventoryCard 
                key={skin.id}
                weaponName={skin.weapon || "Unknown"}
                skinName={skin.name}
                wear={skin.wear || skin.rarity || "Unknown"}
                price={skin.price?.toString() || "N/A"}
                image={skin.image}
                className="animate-fade-in hover:scale-105 transition-transform duration-200"
                style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
              />
            ))
          ) : (
            // Display a message when no skins are found
            <div className="col-span-4 text-center py-8 text-muted-foreground">
              No skins found. Try adjusting your search.
            </div>
          )}
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
          {activityItems.map((item, index) => (
            <ActivityItem 
              key={index}
              type={item.type}
              weaponName={item.weaponName}
              skinName={item.skinName}
              date={item.date}
              price={item.price}
              icon={item.icon}
              className={`${index === 0 ? "pt-0" : ""} hover:bg-secondary/30 transition-colors`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Index;
