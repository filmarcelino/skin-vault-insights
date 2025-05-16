
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSkins, useUserInventory } from "@/hooks/use-skins";
import { useTransactions } from '@/hooks/useTransactions';
import { getWeapons } from '@/services/api';
import { ChevronDown, TrendingUp, TrendingDown, Scale, DollarSign, ShoppingCart, RefreshCcw, Package } from 'lucide-react';
import { useSkinPriceHistory } from '@/hooks/use-skins';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';

// Mock profitable items
const mockProfitableItems = [
  { id: 1, name: 'AK-47 | Redline', purchase: 15.75, current: 22.50, profit: 6.75, profitPercent: 42.85 },
  { id: 2, name: 'AWP | Asiimov', purchase: 45.00, current: 58.20, profit: 13.20, profitPercent: 29.33 },
  { id: 3, name: 'M4A4 | Neo-Noir', purchase: 18.50, current: 23.10, profit: 4.60, profitPercent: 24.86 },
  { id: 4, name: 'Glock-18 | Fade', purchase: 210.00, current: 250.50, profit: 40.50, profitPercent: 19.28 },
  { id: 5, name: 'USP-S | Kill Confirmed', purchase: 35.25, current: 41.00, profit: 5.75, profitPercent: 16.31 },
];

// Mock losting items
const mockLosingItems = [
  { id: 1, name: 'P250 | Asiimov', purchase: 8.50, current: 6.25, profit: -2.25, profitPercent: -26.47 },
  { id: 2, name: 'Five-SeveN | Copper Galaxy', purchase: 5.20, current: 4.10, profit: -1.10, profitPercent: -21.15 },
  { id: 3, name: 'MP9 | Hydra', purchase: 12.30, current: 10.00, profit: -2.30, profitPercent: -18.70 },
  { id: 4, name: 'MAC-10 | Neon Rider', purchase: 7.80, current: 6.50, profit: -1.30, profitPercent: -16.67 },
  { id: 5, name: 'SSG 08 | Dragonfire', purchase: 15.00, current: 13.10, profit: -1.90, profitPercent: -12.67 },
];

export default function Analytics() {
  const [selectedSkin, setSelectedSkin] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [weapons, setWeapons] = useState<string[]>([]);
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions();
  const { data: inventory = [], isLoading: isLoadingInventory } = useUserInventory();
  const { data: skinPriceHistory = [], isLoading: isLoadingHistory } = useSkinPriceHistory(selectedSkin);

  // Fetch weapon types on mount
  useEffect(() => {
    const fetchWeaponTypes = async () => {
      try {
        const weaponTypes = await getWeapons();
        setWeapons(weaponTypes);
      } catch (error) {
        console.error('Error fetching weapon types:', error);
      }
    };
    
    fetchWeaponTypes();
  }, []);

  // Fetch weapons if needed
  useEffect(() => {
    const fetchWeaponTypes = async () => {
      try {
        const weaponTypes = await getWeapons();
        setWeapons(weaponTypes);
      } catch (error) {
        console.error('Error fetching weapon types:', error);
      }
    };
    
    if (!weapons.length) {
      fetchWeaponTypes();
    }
  }, [weapons]);

  // Calculated stats from inventory and transactions
  const stats = React.useMemo(() => {
    if (isLoadingInventory || isLoadingTransactions) {
      return {
        totalValue: 0,
        totalItems: 0,
        profitLoss: 0,
        avgItemValue: 0,
        recentSales: 0,
        recentPurchases: 0
      };
    }

    const totalItems = Array.isArray(inventory) ? inventory.length : 0;
    let totalValue = 0;
    let totalCost = 0;
    
    if (Array.isArray(inventory)) {
      inventory.forEach((item: any) => {
        totalValue += item.currentPrice || item.price || 0;
        totalCost += item.purchasePrice || 0;
      });
    }

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    let recentSales = 0;
    let recentPurchases = 0;
    
    if (Array.isArray(transactions)) {
      transactions.forEach((tx: any) => {
        const txDate = new Date(tx.date);
        if (txDate >= lastMonthDate) {
          if (tx.type === 'sell') {
            recentSales += tx.price || 0;
          } else if (tx.type === 'add' || tx.type === 'buy') {
            recentPurchases += tx.price || 0;
          }
        }
      });
    }

    return {
      totalValue,
      totalItems,
      profitLoss: totalValue - totalCost,
      avgItemValue: totalItems > 0 ? totalValue / totalItems : 0,
      recentSales,
      recentPurchases
    };
  }, [inventory, transactions, isLoadingInventory, isLoadingTransactions]);

  if (isLoadingInventory || isLoadingTransactions) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('analytics.title')}</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('analytics.totalValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{formatPrice(stats.totalValue)}</div>
              <div className="text-xs text-muted-foreground">{stats.totalItems} {t('analytics.items')}</div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              <span>{formatPrice(stats.avgItemValue)} {t('analytics.avgPerItem')}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('analytics.unrealizedProfit')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className={`text-2xl font-bold ${stats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPrice(stats.profitLoss)}
              </div>
              <div className="flex items-center text-xs">
                {stats.profitLoss >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={stats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(stats.profitLoss / (stats.totalValue - stats.profitLoss) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Scale className="h-3 w-3 mr-1" />
              <span>{t('analytics.basedOnPurchasePrice')}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('analytics.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground">{t('analytics.purchases')}</div>
                <div className="text-lg font-medium">{formatPrice(stats.recentPurchases)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t('analytics.sales')}</div>
                <div className="text-lg font-medium">{formatPrice(stats.recentSales)}</div>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <RefreshCcw className="h-3 w-3 mr-1" />
              <span>{t('analytics.last30Days')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.priceHistory')}</CardTitle>
              <CardDescription>
                {t('analytics.trackSkinPerformance')}
              </CardDescription>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="flex-1">
                  <Label htmlFor="skin-select">{t('analytics.selectSkin')}</Label>
                  <Select value={selectedSkin} onValueChange={setSelectedSkin}>
                    <SelectTrigger id="skin-select" className="mt-1">
                      <SelectValue placeholder={t('analytics.chooseSkin')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ak47-redline">{t('skins.ak47Redline')}</SelectItem>
                      <SelectItem value="awp-asiimov">{t('skins.awpAsiimov')}</SelectItem>
                      <SelectItem value="m4a4-neonoir">{t('skins.m4a4NeoNoir')}</SelectItem>
                      <SelectItem value="knife-butterfly">{t('skins.butterflyKnife')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="time-range">{t('analytics.timeRange')}</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger id="time-range" className="mt-1 w-[150px]">
                      <SelectValue placeholder="30 days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">{t('analytics.last7Days')}</SelectItem>
                      <SelectItem value="30d">{t('analytics.last30Days')}</SelectItem>
                      <SelectItem value="90d">{t('analytics.last90Days')}</SelectItem>
                      <SelectItem value="1y">{t('analytics.lastYear')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    {t('common.refresh')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loading />
                </div>
              ) : selectedSkin ? (
                <div className="h-[300px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={skinPriceHistory}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${formatPrice(value)}`, t('analytics.price')]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Package className="h-16 w-16 mb-4 opacity-20" />
                  <p>{t('analytics.selectSkinToView')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.bestPerformers')}</CardTitle>
              <CardDescription>
                {t('analytics.itemsWithBestROI')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profit">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profit">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {t('analytics.gainers')}
                  </TabsTrigger>
                  <TabsTrigger value="loss">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    {t('analytics.losers')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="profit" className="pt-4">
                  <ul className="space-y-3">
                    {mockProfitableItems.map(item => (
                      <li key={item.id} className="flex justify-between items-center text-sm">
                        <div className="truncate mr-2 flex-1">{item.name}</div>
                        <div className="flex items-center text-green-500">
                          <span>{formatPrice(item.profit)}</span>
                          <TrendingUp className="h-3 w-3 ml-1" />
                          <span className="ml-1">+{item.profitPercent.toFixed(1)}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="loss" className="pt-4">
                  <ul className="space-y-3">
                    {mockLosingItems.map(item => (
                      <li key={item.id} className="flex justify-between items-center text-sm">
                        <div className="truncate mr-2 flex-1">{item.name}</div>
                        <div className="flex items-center text-red-500">
                          <span>{formatPrice(item.profit)}</span>
                          <TrendingDown className="h-3 w-3 ml-1" />
                          <span className="ml-1">{item.profitPercent.toFixed(1)}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
