
import React from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Boxes, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsSectionProps {
  isLoading: boolean;
  inventoryStats: {
    totalSkins: number;
    totalValue: string;
    mostValuable: {
      weapon: string;
      skin: string;
      price: string;
      image?: string;
    };
  };
  currentTab: "inventory" | "search";
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  isLoading,
  inventoryStats,
  currentTab,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
      <StatsCard 
        title="Total Skins" 
        value={isLoading && currentTab === "inventory" ? "Loading..." : Number(inventoryStats.totalSkins).toString()} 
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
  );
};
