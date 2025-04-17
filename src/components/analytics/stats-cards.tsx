
import React from "react";
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon, PackageIcon, PercentIcon, TrendingUpIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  
  // Default values when no stats available
  const stats = inventoryStats || {
    total_items: 0,
    total_value: 0,
    avg_price: 0,
    value_change_30d: 0,
    value_change_percentage_30d: 0
  };
  
  const isPositiveChange = stats.value_change_30d >= 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <div className="rounded-full p-2" style={{ backgroundColor: `rgba(75,105,255,0.2)` }}>
            <DollarSignIcon className="h-4 w-4 text-[#4B69FF]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.total_value)}
          </div>
          <p className="text-xs text-muted-foreground">
            Your entire inventory value
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Items Count</CardTitle>
          <div className="rounded-full p-2" style={{ backgroundColor: `rgba(136,71,255,0.2)` }}>
            <PackageIcon className="h-4 w-4 text-[#8847FF]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_items}</div>
          <p className="text-xs text-muted-foreground">
            Total skins in your inventory
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">30 Day Change</CardTitle>
          <div className="rounded-full p-2" style={{ backgroundColor: isPositiveChange ? `rgba(16,185,129,0.2)` : `rgba(239,68,68,0.2)` }}>
            {isPositiveChange ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? "+" : ""}{formatPrice(stats.value_change_30d)}
          </div>
          <p className="text-xs text-muted-foreground">
            Value change in last 30 days
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ROI (30 Days)</CardTitle>
          <div className="rounded-full p-2" style={{ backgroundColor: `rgba(211,44,230,0.2)` }}>
            <PercentIcon className="h-4 w-4 text-[#D32CE6]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.value_change_percentage_30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.value_change_percentage_30d >= 0 ? "+" : ""}
            {stats.value_change_percentage_30d.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Percentage return on investment
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
