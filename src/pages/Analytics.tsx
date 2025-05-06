
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ArrowUpRight, ArrowDownRight, BarChart3, Package, Percent, TrendingUp, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getRarityColor } from "@/utils/skin-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LineChart } from '@/components/ui/chart';
import { StatsCards } from '@/components/analytics/stats-cards';
import { useInventory } from '@/hooks/use-skins';

interface InventoryStats {
  total_items: number;
  total_value: number;
  avg_price: number;
  value_change_30d: number;
  value_change_percentage_30d: number;
}

interface DetailedInventoryStats {
  totalValue: number;
  profitLoss: number;
  itemCount: number;
  averageItemValue: number;
  valueChange30d: number;
  valueChangePercent: number;
  topRarities: Array<{name: string, count: number}>;
  recentTransactions: Array<{id: string, name: string, type: string, value: number, date: string}>;
}

const RarityDistribution: FC<{
  rarities: Array<{name: string, count: number}> | undefined;
  loading: boolean;
}> = ({ rarities, loading }) => {
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-lg">Rarity Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Rarity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rarities?.map(rarity => (
            <div 
              key={rarity.name}
              className="flex flex-col items-center p-3 rounded-lg border"
              style={{ 
                backgroundColor: `${getRarityColor(rarity.name)}20`,
                borderColor: getRarityColor(rarity.name)
              }}
            >
              <span className="font-medium" style={{ color: getRarityColor(rarity.name) }}>
                {rarity.name}
              </span>
              <span className="text-2xl font-bold">{rarity.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RecentTransactions: FC<{
  transactions: Array<{id: string, name: string, type: string, value: number, date: string}> | undefined;
  loading: boolean;
}> = ({ transactions, loading }) => {
  const { formatPrice } = useCurrency();
  
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions?.length ? (
            transactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{tx.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {tx.type === 'sell' ? 'Sell' : tx.type === 'add' ? 'Buy' : tx.type}
                    {' • '}
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={tx.type === 'sell' ? 'text-green-500' : 'text-muted-foreground'}>
                  {formatPrice(tx.value)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent transactions</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PremiumFeatureCard = () => {
  return (
    <Card className="col-span-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 z-0"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="text-lg flex items-center gap-2">
          Price History
          <Lock className="h-4 w-4 text-amber-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex flex-col items-center justify-center relative z-10">
        <div className="text-center space-y-4">
          <div className="rounded-full bg-amber-500/20 p-3 w-16 h-16 mx-auto flex items-center justify-center">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Premium Feature</h3>
            <p className="text-muted-foreground">Upgrade to Premium to view detailed price history charts</p>
          </div>
          <Button variant="outline" className="bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white border-amber-500 hover:from-amber-600/80 hover:to-amber-700/80">
            Upgrade to Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const { formatPrice, currency } = useCurrency();
  const { user } = useAuth();
  const { data: inventoryData } = useInventory();
  
  const { data: inventoryStats, isLoading } = useQuery({
    queryKey: ['inventoryStats', currency.code, user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        console.log('Fetching inventory and transaction data for analytics...');
        
        // Get current inventory items
        const { data: inventoryItems, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_in_user_inventory', true);
        
        if (inventoryError) {
          console.error('Error fetching inventory:', inventoryError);
          throw new Error(inventoryError.message);
        }
        
        console.log(`Found ${inventoryItems?.length || 0} inventory items`);
        
        // Get transactions (both buys and sells)
        const { data: transactionItems, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (transactionError) {
          console.error('Error fetching transactions:', transactionError);
          throw new Error(transactionError.message);
        }
        
        console.log(`Found ${transactionItems?.length || 0} transactions`);
        
        // Calculate total current inventory value
        const totalValue = inventoryItems ? inventoryItems.reduce((sum, item) => {
          const value = item.current_price || item.price || 0;
          return sum + parseFloat(String(value));
        }, 0) : 0;
        
        // Calculate profit/loss (current value vs purchase value)
        const profitLoss = inventoryItems ? inventoryItems.reduce((sum, item) => {
          const currentValue = parseFloat(String(item.current_price || item.price || 0));
          const purchaseValue = parseFloat(String(item.purchase_price || currentValue));
          return sum + (currentValue - purchaseValue);
        }, 0) : 0;
        
        // Add profit from sold items
        const soldItemsProfit = transactionItems ? transactionItems
          .filter(tx => tx.type === 'sell')
          .reduce((sum, tx) => {
            // Find the matching 'add' transaction to calculate profit
            const addTransaction = transactionItems.find(
              addTx => addTx.item_id === tx.item_id && addTx.type === 'add'
            );
            
            if (addTransaction) {
              const sellPrice = parseFloat(String(tx.price || 0));
              const buyPrice = parseFloat(String(addTransaction.price || 0));
              return sum + (sellPrice - buyPrice);
            }
            
            return sum + parseFloat(String(tx.price || 0)); // If no matching buy, count full sell as profit
          }, 0) : 0;
        
        // Calculate average item value
        const itemCount = inventoryItems?.length || 0;
        const averageItemValue = itemCount > 0 ? totalValue / itemCount : 0;
        
        // Count items by rarity
        const rarityCounts: {[key: string]: number} = {};
        if (inventoryItems) {
          inventoryItems.forEach(item => {
            if (item.rarity) {
              rarityCounts[item.rarity] = (rarityCounts[item.rarity] || 0) + 1;
            }
          });
        }
        
        const topRarities = Object.entries(rarityCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        
        // Format recent transactions for UI
        const recentTransactions = transactionItems ? 
          transactionItems
            .slice(0, 5)
            .map(tx => ({
              id: tx.transaction_id || tx.id,
              name: `${tx.weapon_name || ''} | ${tx.skin_name || 'Unknown'}`,
              type: tx.type,
              value: parseFloat(String(tx.price) || '0'),
              date: tx.date
            })) : [];
        
        // Calculate 30-day value change
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Value change calculations from transactions
        const valueChange30d = transactionItems ? 
          transactionItems
            .filter(tx => {
              const txDate = new Date(tx.date);
              return txDate > thirtyDaysAgo;
            })
            .reduce((sum, tx) => {
              if (tx.type === 'sell') {
                // For sells, count profit/loss compared to purchase price
                const addTransaction = transactionItems.find(
                  addTx => addTx.item_id === tx.item_id && addTx.type === 'add'
                );
                
                if (addTransaction) {
                  const sellPrice = parseFloat(String(tx.price || 0));
                  const buyPrice = parseFloat(String(addTransaction.price || 0));
                  return sum + (sellPrice - buyPrice);
                }
                return sum + parseFloat(String(tx.price || 0));
              } else if (tx.type === 'add') {
                // For buys, we don't add to value change as it's just a conversion of cash to item
                return sum;
              }
              return sum;
            }, 0) : 0;
        
        // Calculate percentage change (using total value as denominator)
        const valueChangePercent = totalValue > 0 
          ? (valueChange30d / totalValue) * 100
          : 0;
        
        // Final stats object
        const stats = {
          totalValue: parseFloat(totalValue.toFixed(3)),
          profitLoss: parseFloat((profitLoss + soldItemsProfit).toFixed(3)),
          itemCount,
          averageItemValue: parseFloat(averageItemValue.toFixed(3)),
          valueChange30d: parseFloat(valueChange30d.toFixed(3)),
          valueChangePercent: parseFloat(valueChangePercent.toFixed(3)),
          topRarities,
          recentTransactions
        };
        
        return stats;
      } catch (error) {
        console.error('Error calculating inventory stats:', error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Prepare data for stats cards
  const statsForCards: InventoryStats = {
    total_items: inventoryStats?.itemCount || 0,
    total_value: inventoryStats?.totalValue || 0,
    avg_price: inventoryStats?.averageItemValue || 0,
    value_change_30d: inventoryStats?.valueChange30d || 0,
    value_change_percentage_30d: inventoryStats?.valueChangePercent || 0
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* StatsCards component with accurate inventory data */}
          <StatsCards inventoryStats={statsForCards} />

          {/* Rarity distribution card */}
          <RarityDistribution 
            rarities={inventoryStats?.topRarities} 
            loading={isLoading} 
          />
          
          {/* Recent transactions card */}
          <RecentTransactions 
            transactions={inventoryStats?.recentTransactions} 
            loading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <PremiumFeatureCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
