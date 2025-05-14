
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryActions } from "@/hooks/useInventoryActions";
import { useLanguage } from "@/contexts/LanguageContext";
import { InventoryItem } from "@/types/skin";

export interface SoldSkinsTableProps {
  items: any[];
  isLoading?: boolean;
  onEdit?: (item: any) => void;
}

export const SoldSkinsTable = ({ 
  items, 
  isLoading = false, 
  onEdit 
}: SoldSkinsTableProps) => {
  const { formatPrice } = useCurrency();
  const { handleEdit: defaultHandleEdit } = useInventoryActions();
  const { t } = useLanguage();
  
  // Use provided onEdit or fall back to default handleEdit from hook
  const editHandler = onEdit || defaultHandleEdit;

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
        {t('inventory.noSoldItems')}
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{t('inventory.skin')}</TableHead>
            <TableHead>{t('inventory.soldDate')}</TableHead>
            <TableHead className="text-right">{t('inventory.purchaseValue')}</TableHead>
            <TableHead className="text-right">{t('inventory.soldValue')}</TableHead>
            <TableHead className="text-right">{t('inventory.profitLoss')}</TableHead>
            <TableHead className="text-right">{t('inventory.notes')}</TableHead>
            <TableHead className="w-[100px]">{t('inventory.actions')}</TableHead>
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
                <Button variant="ghost" size="icon" onClick={() => editHandler(item)}>
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
