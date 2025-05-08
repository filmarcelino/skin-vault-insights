
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Skeleton } from "@/components/ui/skeleton";

interface SoldSkinsTableProps {
  items: any[];
  isLoading: boolean;
  onEdit: (item: any) => void;
}

export const SoldSkinsTable = ({ items, isLoading, onEdit }: SoldSkinsTableProps) => {
  const { formatPrice } = useCurrency();

  // Função para calcular o lucro percentual
  const calculateProfitPercentage = (soldPrice: number, purchasePrice: number) => {
    if (!purchasePrice || purchasePrice === 0) return 0;
    return ((soldPrice - purchasePrice) / purchasePrice) * 100;
  };

  // Função para formatar o percentual de lucro/prejuízo
  const formatProfitPercentage = (percentage: number) => {
    const isProfit = percentage >= 0;
    return (
      <span className={`font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
        {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="w-full h-16">
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum item vendido encontrado.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Skin</TableHead>
            <TableHead>Data da Venda</TableHead>
            <TableHead className="text-right">Valor de Compra</TableHead>
            <TableHead className="text-right">Valor Vendido</TableHead>
            <TableHead className="text-right">Lucro/Prejuízo</TableHead>
            <TableHead className="text-right">Notas</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.weapon_name} | {item.skin_name}
              </TableCell>
              <TableCell>
                {new Date(item.date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {item.purchase_price ? formatPrice(item.purchase_price) : '-'}
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(item.price || 0)}
              </TableCell>
              <TableCell className="text-right">
                {item.purchase_price ? formatProfitPercentage(calculateProfitPercentage(item.price || 0, item.purchase_price)) : '-'}
              </TableCell>
              <TableCell className="text-right max-w-[200px] truncate">
                {item.notes || '-'}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
