
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ArrowUpRight, ArrowDownRight, BarChart3, Package, Percent, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getRarityColor, getRarityColorClass } from "@/utils/skin-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface para os dados de estatísticas do inventário
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

// Componente para exibir um card de estatística
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

// Componente para exibir o resumo de lucro/prejuízo
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

// Componente para mostrar distribuição de raridade
const RarityDistribution: React.FC<{
  rarities: Array<{name: string, count: number}> | undefined;
  loading: boolean;
}> = ({ rarities, loading }) => {
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Raridades</CardTitle>
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
        <CardTitle className="text-lg">Distribuição de Raridades</CardTitle>
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

// Componente para transações recentes
const RecentTransactions: React.FC<{
  transactions: Array<{id: string, name: string, type: string, value: number, date: string}> | undefined;
  loading: boolean;
}> = ({ transactions, loading }) => {
  const { formatPrice } = useCurrency();
  
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-lg">Transações Recentes</CardTitle>
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
        <CardTitle className="text-lg">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions?.length ? (
            transactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{tx.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {tx.type === 'sell' ? 'Venda' : tx.type === 'add' ? 'Compra' : tx.type}
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
            <p className="text-center text-muted-foreground py-4">Nenhuma transação recente</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const { formatPrice, currency } = useCurrency();
  
  // Buscar dados reais do inventário
  const { data: inventoryStats, isLoading } = useQuery<InventoryStats>({
    queryKey: ['inventoryStats', currency.code],
    queryFn: async () => {
      // Simular requisição para API real que obtém estatísticas do inventário
      // Em uma implementação real, isto seria uma chamada para o backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de rede
      
      // Retornar dados de amostra que seriam obtidos da API
      return {
        totalValue: 8750.42,
        profitLoss: 1278.65,
        itemCount: 32,
        averageItemValue: 273.45,
        valueChange30d: 345.78,
        valueChangePercent: 3.8,
        topRarities: [
          { name: "Covert", count: 3 },
          { name: "Classified", count: 7 },
          { name: "Restricted", count: 12 },
          { name: "Mil-Spec Grade", count: 10 }
        ],
        recentTransactions: [
          { id: "tx1", name: "AWP | Asiimov", type: "sell", value: 120.50, date: "2025-04-10T15:30:00Z" },
          { id: "tx2", name: "AK-47 | Redline", type: "add", value: 45.75, date: "2025-04-08T12:15:00Z" },
          { id: "tx3", name: "M4A4 | Neo-Noir", type: "sell", value: 32.25, date: "2025-04-05T09:45:00Z" }
        ]
      };
    }
  });

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Valor Total do Inventário"
              value={inventoryStats?.totalValue}
              icon={<DollarSign />}
              loading={isLoading}
              iconColor="#4B69FF" // Azul - Mil-Spec
              bgColorClass="bg-[rgba(75,105,255,0.05)]"
            />
            
            <ProfitLossSummary 
              profitLoss={inventoryStats?.profitLoss} 
              loading={isLoading} 
            />
            
            <StatCard
              title="Quantidade de Itens"
              value={inventoryStats?.itemCount}
              icon={<Package />}
              isCurrency={false}
              loading={isLoading}
              iconColor="#8847FF" // Roxo - Restricted
              bgColorClass="bg-[rgba(136,71,255,0.05)]"
            />
            
            <StatCard
              title="Valor Médio por Item"
              value={inventoryStats?.averageItemValue}
              icon={<BarChart3 />}
              loading={isLoading}
              iconColor="#D32CE6" // Rosa - Classified
              bgColorClass="bg-[rgba(211,44,230,0.05)]"
            />
            
            <StatCard
              title="Variação em 30 dias"
              value={inventoryStats?.valueChange30d}
              icon={<TrendingUp />}
              loading={isLoading}
              iconColor="#EB4B4B" // Vermelho - Covert
              bgColorClass="bg-[rgba(235,75,75,0.05)]"
            />
            
            <StatCard
              title="Variação Percentual"
              value={inventoryStats?.valueChangePercent}
              icon={<Percent />}
              isCurrency={false}
              loading={isLoading}
              iconColor="#FFD700" // Dourado - Contraband
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
              <CardTitle className="text-lg">Histórico de Preços</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">
                Os gráficos de tendências estarão disponíveis em breve
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
