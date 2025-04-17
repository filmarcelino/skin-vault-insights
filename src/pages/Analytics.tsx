
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
import { format, startOfMonth, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { PriceHistoryItem, Transaction } from "@/types/skin";

const Analytics = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30), // 30 dias atrás
    to: new Date(),
  });

  // Buscar estatísticas do inventário
  const { data: inventoryStats, isLoading: statsLoading } = useQuery({
    queryKey: ["inventory-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.rpc('get_inventory_stats', {
        user_uuid: user.id
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Buscar dados do inventário para simular histórico de preços
  const { data: inventoryData, isLoading: historyLoading } = useQuery<PriceHistoryItem[]>({
    queryKey: ["inventory-data", user?.id, dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      if (!user || !dateRange.from || !dateRange.to) return [];
      
      // Formatar intervalo de data para consulta
      const fromDate = format(dateRange.from, "yyyy-MM-dd");
      const toDate = format(dateRange.to, "yyyy-MM-dd");
      
      // Buscar dados do inventário já que não temos ainda a tabela skin_price_history
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching inventory data:", error);
        return [];
      }
      
      // Transformar os dados de inventário em dados de histórico de preços simulados
      const priceHistoryData: PriceHistoryItem[] = [];
      
      if (data) {
        // Gerar pontos de dados para cada item do inventário
        data.forEach(item => {
          // Data de aquisição como primeiro ponto
          const acquiredDate = new Date(item.acquired_date);
          
          // Se a data de aquisição estiver dentro do intervalo selecionado
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
          
          // Se o item tiver um preço atual diferente do preço de compra, adicionar como ponto atual
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

  // Buscar dados de transações para análise de ROI
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions-data", user?.id, dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      if (!user || !dateRange.from || !dateRange.to) return [];
      
      // Formatar intervalo de data para consulta
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
      
      // Converter os tipos de dados para o formato Transaction
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

  // Processar dados para gráficos
  const priceHistoryChartData = React.useMemo(() => {
    if (!inventoryData || inventoryData.length === 0) return [];

    // Agrupar por data, calcular preço médio por dia
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

  // Calcular dados de ROI
  const roiData = React.useMemo(() => {
    if (!transactionsData || transactionsData.length === 0) return [];

    // Agrupar transações por tipo (compra vs venda)
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

    // Combinar dados para cálculo de ROI
    const combinedData: Record<string, { cost: number; revenue: number }> = {};
    Object.keys(purchasesByItem).forEach(itemId => {
      combinedData[itemId] = purchasesByItem[itemId];
    });
    Object.keys(salesByItem).forEach(itemId => {
      if (!combinedData[itemId]) combinedData[itemId] = { cost: 0, revenue: 0 };
      combinedData[itemId].revenue = salesByItem[itemId].revenue;
    });

    // Calcular ROI para cada item
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

  // Calcular as skins com melhor desempenho
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
              <Card>
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
              <Card>
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
              <Card>
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

