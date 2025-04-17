import React from "react";
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon, PackageIcon, PercentIcon, TrendingUpIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getRarityColor } from "@/utils/skin-utils";

interface StatsCardsProps {
  inventoryStats: {
    total_items: number;
    total_value: number;
    avg_price: number;
    value_change_30d: number;
    value_change_percentage_30d: number;
  } | null;
}

export function StatsCards({ inventoryStats }: StatsCardsProps) {
  const { formatPrice } = useCurrency();
  
  const stats = inventoryStats || {
    total_items: 0,
    total_value: 0,
    avg_price: 0,
    value_change_30d: 0,
    value_change_percentage_30d: 0
  };
  
  const isPositiveChange = stats.value_change_30d >= 0;

  const metallicRarityColors = {
    consumerGrade: '#8E9196', // Neutral metallic gray
    industrialGrade: '#5E7D9A', // Steel blue
    milSpec: '#4A6D7C', // Deep steel blue
    restricted: '#6E5AB0', // Metallic purple
    classified: '#8A4E9E', // Metallic magenta
    covert: '#9A4A4A', // Metallic deep red
    contraband: '#B8A246', // Metallic gold
    special: '#A69D7E', // Metallic pale gold
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card style={{ 
        backgroundColor: metallicRarityColors.milSpec, 
        color: '#FFFFFF', 
        border: 'none', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
      }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Total Value</CardTitle>
          <div className="rounded-full p-2 bg-white/20">
            <DollarSignIcon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatPrice(stats.total_value)}
          </div>
          <p className="text-xs text-white/70">
            Your entire inventory value
          </p>
        </CardContent>
      </Card>
      
      <Card style={{ 
        backgroundColor: metallicRarityColors.restricted, 
        color: '#FFFFFF', 
        border: 'none', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
      }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Items Count</CardTitle>
          <div className="rounded-full p-2 bg-white/20">
            <PackageIcon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.total_items}</div>
          <p className="text-xs text-white/70">
            Total skins in your inventory
          </p>
        </CardContent>
      </Card>
      
      <Card style={{ 
        backgroundColor: isPositiveChange ? '#4A6D7C' : '#9A4A4A', 
        color: '#FFFFFF', 
        border: 'none', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
      }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">30 Day Change</CardTitle>
          <div className="rounded-full p-2 bg-white/20">
            {isPositiveChange ? (
              <ArrowUpIcon className="h-4 w-4 text-white" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-white" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {isPositiveChange ? "+" : ""}{formatPrice(stats.value_change_30d)}
          </div>
          <p className="text-xs text-white/70">
            Value change in last 30 days
          </p>
        </CardContent>
      </Card>
      
      <Card style={{ 
        backgroundColor: metallicRarityColors.classified, 
        color: '#FFFFFF', 
        border: 'none', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
      }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">ROI (30 Days)</CardTitle>
          <div className="rounded-full p-2 bg-white/20">
            <PercentIcon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.value_change_percentage_30d >= 0 ? "+" : ""}
            {stats.value_change_percentage_30d.toFixed(2)}%
          </div>
          <p className="text-xs text-white/70">
            Percentage return on investment
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
