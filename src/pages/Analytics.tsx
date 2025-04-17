
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ArrowUpRight, ArrowDownRight, BarChart3, Package, Percent, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getRarityColor, getRarityColorClass } from "@/utils/skin-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Interface for inventory statistics data
interface InventoryStats {
  totalValue: number;
  profitLoss: number;
  itemCount: number;
  averageItemValue: number;
  valueChange30d: number;
  valueChangePercent: number;
  topRarities: Array<{name: string, count: number}>;
  recentTransactions: Array<{id: string, name: string, type: string, value: number, date: string}>;
}

// Component for displaying a statistic card
const StatCard: React.FC<{
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  isCurrency?: boolean;
  loading: boolean;
  iconColor?: string;
  bgColorClass?: string;
}> = ({ title, value, icon, isCurrency = true, loading, iconColor = "#8B5CF6", bgColorClass }) => {
  const { formatPrice } = useCurrency();
  
  return (
    <Card className={`${bgColorClass || ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full p-2" style={{ backgroundColor: `${iconColor}30` }}>
          {React.cloneElement(icon as React.ReactElement, { 
            className: "h-4 w-4", 
            style: { color: iconColor } 
          })}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-4 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold">
            {isCurrency ? formatPrice(value) : value?.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component for displaying profit/loss summary
const ProfitLossSummary: React.FC<{
  profitLoss: number | undefined;
  loading: boolean;
}> = ({ profitLoss, loading }) => {
  const { formatPrice } = useCurrency();
  const isProfit = profitLoss !== undefined && profitLoss > 0;
  const arrowIcon = isProfit ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />;
  const badgeVariant = isProfit ? "outline" : "destructive";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Profit / Loss</CardTitle>
        <div className="rounded-full p-2 bg-opacity-20" style={{ backgroundColor: isProfit ? "#10B981" : "#EF4444", opacity: 0.2 }}>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-4 w-[100px]" />
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold" style={{ color: isProfit ? "#10B981" : "#EF4444" }}>
              {formatPrice(profitLoss)}
            </div>
            <Badge variant={badgeVariant}>
              {arrowIcon}
              {isProfit ? "Profit" : "Loss"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component for showing rarity distribution
const RarityDistribution: React.FC<{
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

// Component for recent transactions
const RecentTransactions: React.FC<{
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

const Analytics = () => {
  const { formatPrice, currency } = useCurrency();
  const { user } = useAuth();
  
  // Fetch real inventory data from Supabase
  const { data: inventoryStats, isLoading } = useQuery({
    queryKey: ['inventoryStats', currency.code, user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        console.log('Fetching inventory data for analytics...');
        
        // 1. Get total items and values
        const { data: inventoryItems, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_in_user_inventory', true);
        
        if (inventoryError) {
          console.error('Error fetching inventory:', inventoryError);
          throw new Error(inventoryError.message);
        }
        
        console.log(`Found ${inventoryItems.length} inventory items`);
        
        // 2. Get recent transactions
        const { data: transactionItems, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);
          
        if (transactionError) {
          console.error('Error fetching transactions:', transactionError);
          throw new Error(transactionError.message);
        }
        
        console.log(`Found ${transactionItems?.length || 0} transactions`);
        
        // Calculate inventory statistics
        const totalValue = inventoryItems.reduce((sum, item) => {
          const value = item.current_price || item.price || 0;
          return sum + value;
        }, 0);
        
        // Calculate profit/loss (difference between current values and purchase prices)
        const profitLoss = inventoryItems.reduce((sum, item) => {
          const currentValue = item.current_price || item.price || 0;
          const purchaseValue = item.purchase_price || currentValue;
          return sum + (currentValue - purchaseValue);
        }, 0);
        
        // Calculate average item value
        const averageItemValue = inventoryItems.length > 0 
          ? totalValue / inventoryItems.length 
          : 0;
        
        // Count rarities
        const rarityCounts: {[key: string]: number} = {};
        inventoryItems.forEach(item => {
          if (item.rarity) {
            rarityCounts[item.rarity] = (rarityCounts[item.rarity] || 0) + 1;
          }
        });
        
        const topRarities = Object.entries(rarityCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        
        // Format transactions for display
        const recentTransactions = transactionItems.map(tx => ({
          id: tx.id,
          name: `${tx.weapon_name || ''} | ${tx.skin_name || 'Unknown'}`,
          type: tx.type,
          value: tx.price || 0,
          date: tx.date
        }));
        
        // Simulate 30-day value change based on recent transactions
        // This is a simple approximation - in a real app you'd have historical price data
        const valueChange30d = transactionItems
          .filter(tx => {
            const txDate = new Date(tx.date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return txDate > thirtyDaysAgo;
          })
          .reduce((sum, tx) => {
            if (tx.type === 'sell') {
              return sum + (tx.price || 0);
            } else if (tx.type === 'add') {
              return sum - (tx.price || 0);
            }
            return sum;
          }, 0);
        
        const valueChangePercent = totalValue > 0 
          ? (valueChange30d / totalValue) * 100
          : 0;
        
        return {
          totalValue,
          profitLoss,
          itemCount: inventoryItems.length,
          averageItemValue,
          valueChange30d,
          valueChangePercent,
          topRarities,
          recentTransactions
        };
      } catch (error) {
        console.error('Error calculating inventory stats:', error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Inventory Value"
              value={inventoryStats?.totalValue}
              icon={<DollarSign />}
              loading={isLoading}
              iconColor="#4B69FF" // Blue - Mil-Spec
              bgColorClass="bg-[rgba(75,105,255,0.05)]"
            />
            
            <ProfitLossSummary 
              profitLoss={inventoryStats?.profitLoss} 
              loading={isLoading} 
            />
            
            <StatCard
              title="Item Count"
              value={inventoryStats?.itemCount}
              icon={<Package />}
              isCurrency={false}
              loading={isLoading}
              iconColor="#8847FF" // Purple - Restricted
              bgColorClass="bg-[rgba(136,71,255,0.05)]"
            />
            
            <StatCard
              title="Average Item Value"
              value={inventoryStats?.averageItemValue}
              icon={<BarChart3 />}
              loading={isLoading}
              iconColor="#D32CE6" // Pink - Classified
              bgColorClass="bg-[rgba(211,44,230,0.05)]"
            />
            
            <StatCard
              title="30 Day Change"
              value={inventoryStats?.valueChange30d}
              icon={<TrendingUp />}
              loading={isLoading}
              iconColor="#EB4B4B" // Red - Covert
              bgColorClass="bg-[rgba(235,75,75,0.05)]"
            />
            
            <StatCard
              title="Percent Change"
              value={inventoryStats?.valueChangePercent}
              icon={<Percent />}
              isCurrency={false}
              loading={isLoading}
              iconColor="#FFD700" // Gold - Contraband
              bgColorClass="bg-[rgba(255,215,0,0.05)]"
            />
          </div>

          <RarityDistribution 
            rarities={inventoryStats?.topRarities} 
            loading={isLoading} 
          />
          
          <RecentTransactions 
            transactions={inventoryStats?.recentTransactions} 
            loading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="text-lg">Price History</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">
                Trend charts will be available soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
