import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Adicionar interface para os dados de estatísticas do inventário
interface InventoryStats {
  totalValue: number;
  profitLoss: number;
  // Adicionar outros campos conforme necessário
}

// Componente para exibir um card de estatística
const StatCard: React.FC<{
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  isCurrency?: boolean;
  loading: boolean;
}> = ({ title, value, icon, isCurrency = true, loading }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-4 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold">
            {isCurrency ? `$${value?.toLocaleString()}` : value?.toLocaleString()}
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
  const isProfit = profitLoss !== undefined && profitLoss > 0;
  const arrowIcon = isProfit ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />;
  const badgeVariant = isProfit ? "outline" : "destructive";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Profit / Loss</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-4 w-[100px]" />
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">${profitLoss?.toLocaleString()}</div>
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

const Analytics = () => {
  // No componente, atualizar o useQuery
  const { data: inventoryStats, isLoading } = useQuery<InventoryStats>({
    queryKey: ['inventoryStats'],
    queryFn: async () => {
      // Manter a lógica existente, mas garantir que retorne um objeto que corresponda à interface InventoryStats
      return {
        totalValue: 10000, // valor de exemplo
        profitLoss: 2500,  // valor de exemplo
        // outros campos conforme necessário
      };
    }
  });

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory Value"
          value={inventoryStats?.totalValue}
          icon={<DollarSign className="h-4 w-4" />}
          loading={isLoading}
        />
        <ProfitLossSummary profitLoss={inventoryStats?.profitLoss} loading={isLoading} />
        {/* Adicione mais StatCards conforme necessário */}
      </div>

      {/* Adicione gráficos ou outros componentes de análise aqui */}
    </div>
  );
};

export default Analytics;
