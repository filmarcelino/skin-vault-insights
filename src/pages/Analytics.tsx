import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, BarChart } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loading } from "@/components/ui/loading";
import { CalendarDateRangePicker } from "@/components/analytics/date-range-picker";
import { StatsCards } from "@/components/analytics/stats-cards";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { PriceHistoryItem, Transaction } from "@/types/skin";

interface InventoryStats {
  total_items: number;
  total_value: number;
  avg_price: number;
  value_change_30d: number;
  value_change_percentage_30d: number;
}

const Analytics = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: inventoryStats, isLoading: statsLoading } = useQuery<InventoryStats | null>({
    queryKey: ["inventory-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.rpc('get_inventory_stats', {
        user_uuid: user.id
      });
      
      if (error) throw error;
      return data as InventoryStats;
    },
    enabled: !!user,
  });

  const { data: inventoryData, isLoading: historyLoading } = useQuery<PriceHistoryItem[]>({
    queryKey: ["inventory-data", user?.id, dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      if (!user || !dateRange.from || !dateRange.to) return [];
      
      const fromDate = format(dateRange.from, "yyyy-MM-dd");
      const toDate = format(dateRange.to, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching inventory data:", error);
        return [];
      }
      
      const priceHistoryData: PriceHistoryItem[] = [];
      
      if (data) {
        data.forEach(item => {
          const acquiredDate = new Date(item.acquired_date);
          
          if (acquiredDate >= dateRange.from && acquiredDate <= dateRange.to) {
            priceHistoryData.push({
              id: `${item.id}-acquired`,
              skin_id: item.skin_id,
              inventory_id: item.id,
              user_id: item.user_id,
              price: item.purchase_price || 0,
              price_date: item.acquired_date,
              marketplace: item.marketplace,
              wear: item.wear,
              created_at: item.created_at
            });
          }
          
          if (item.current_price && item.current_price !== item.purchase_price) {
            priceHistoryData.push({
              id: `${item.id}-current`,
              skin_id: item.skin_id,
              inventory_id: item.id,
              user_id: item.user_id,
              price: item.current_price,
              price_date: new Date().toISOString(),
              marketplace: item.marketplace,
              wear: item.wear,
              created_at: item.created_at
            });
          }
        });
      }
      
      return priceHistoryData;
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions-data", user?.id, dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      if (!user || !dateRange.from || !dateRange.to) return [];
      
      const fromDate = format(dateRange.from, "yyyy-MM-dd");
      const toDate = format(dateRange.to, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", fromDate)
        .lte("date", toDate)
        .order("date", { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id || item.transaction_id || "",
        type: item.type as 'add' | 'sell' | 'trade' | 'purchase',
        itemId: item.item_id || "",
        weaponName: item.weapon_name || "",
        skinName: item.skin_name || "",
        date: item.date || "",
        price: item.price || 0,
        notes: item.notes || ""
      })) as Transaction[];
    },
    enabled: !!user && !!dateRange.from && !!dateRange.to,
  });

  const priceHistoryChartData = React.useMemo(() => {
    if (!inventoryData || inventoryData.length === 0) return [];

    const groupedByDate = inventoryData.reduce((acc, item) => {
      const date = item.price_date.split("T")[0];
      if (!acc[date]) {
        acc[date] = { total: 0, count: 0 };
      }
      acc[date].total += parseFloat(String(item.price));
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.keys(groupedByDate).map(date => ({
      date: date,
      price: groupedByDate[date].total / groupedByDate[date].count
    }));
  }, [inventoryData]);

  const roiData = React.useMemo(() => {
    if (!transactionsData || transactionsData.length === 0) return [];

    const purchasesByItem = transactionsData
      .filter(t => t.type === 'purchase')
      .reduce((acc, item) => {
        const key = item.itemId || '';
        if (!acc[key]) acc[key] = { cost: 0, revenue: 0 };
        acc[key].cost += typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '0'));
        return acc;
      }, {} as Record<string, { cost: number; revenue: number }>);

    const salesByItem = transactionsData
      .filter(t => t.type === 'sell')
      .reduce((acc, item) => {
        const key = item.itemId || '';
        if (!acc[key]) acc[key] = { cost: 0, revenue: 0 };
        acc[key].revenue += typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '0'));
        return acc;
      }, {} as Record<string, { cost: number; revenue: number }>);

    const combinedData: Record<string, { cost: number; revenue: number }> = {};
    Object.keys(purchasesByItem).forEach(itemId => {
      combinedData[itemId] = purchasesByItem[itemId];
    });
    Object.keys(salesByItem).forEach(itemId => {
      if (!combinedData[itemId]) combinedData[itemId] = { cost: 0, revenue: 0 };
      combinedData[itemId].revenue = salesByItem[itemId].revenue;
    });

    const result = Object.keys(combinedData).map(itemId => {
      const { cost, revenue } = combinedData[itemId];
      const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
      return {
        item_id: itemId,
        roi: roi,
        profit: revenue - cost,
        cost: cost,
        revenue: revenue
      };
    });

    return result;
  }, [transactionsData]);

  const topPerformingSkins = React.useMemo(() => {
    if (!roiData || roiData.length === 0) return [];
    return [...roiData]
      .filter(item => item.profit > 0)
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);
  }, [roiData]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      setDateRange({ 
        from: range.from,
        to: range.to || new Date() 
      });
    }
  };

  const isLoading = statsLoading || historyLoading || transactionsLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your inventory performance and investment metrics</p>
        </div>
        <CalendarDateRangePicker date={dateRange} setDate={handleDateRangeChange} />
      </div>

      {isLoading ? (
        <Loading size="lg" />
      ) : (
        <>
          <StatsCards inventoryStats={inventoryStats} />

          <Tabs defaultValue="price-trends">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="price-trends">Price Trends</TabsTrigger>
              <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
              <TabsTrigger value="top-performing">Top Performing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="price-trends" className="space-y-4">
              <Card className="bg-[#1A1F2C] border-[#333333]">
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                  <CardDescription>
                    Track how your inventory value has changed over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {priceHistoryChartData.length > 0 ? (
                    <LineChart 
                      data={priceHistoryChartData} 
                      categories={["price"]}
                      index="date"
                      colors={["blue"]}
                      valueFormatter={(value) => `$${value.toFixed(2)}`}
                      className="aspect-[2/1]"
                    />
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No price history data available for the selected date range.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="roi" className="space-y-4">
              <Card className="bg-[#1A1F2C] border-[#333333]">
                <CardHeader>
                  <CardTitle>Return on Investment</CardTitle>
                  <CardDescription>
                    Compare your purchase costs vs. sales revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {roiData.length > 0 ? (
                    <BarChart 
                      data={roiData} 
                      categories={["cost", "revenue"]}
                      index="item_id"
                      colors={["orange", "green"]}
                      valueFormatter={(value) => `$${value.toFixed(2)}`}
                      className="aspect-[2/1]"
                    />
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No transaction data available for ROI analysis.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="top-performing" className="space-y-4">
              <Card className="bg-[#1A1F2C] border-[#333333]">
                <CardHeader>
                  <CardTitle>Top Performing Skins</CardTitle>
                  <CardDescription>
                    Your skins with the highest ROI percentage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topPerformingSkins.length > 0 ? (
                    <BarChart 
                      data={topPerformingSkins} 
                      categories={["roi"]}
                      index="item_id"
                      colors={["green"]}
                      valueFormatter={(value) => `${value.toFixed(2)}%`}
                      className="aspect-[2/1]"
                    />
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No top performing skins found in the selected date range.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Analytics;
