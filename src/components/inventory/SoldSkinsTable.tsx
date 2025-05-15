
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { InventoryItem } from "@/types/skin";
import { formatDateString } from "@/utils/date-utils";
import { formatPrice } from "@/utils/format-utils";

interface SoldSkinsTableProps {
  items: InventoryItem[];
}

export const SoldSkinsTable: React.FC<SoldSkinsTableProps> = ({ items }) => {
  // Format date function
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    return formatDateString(dateStr);
  };

  // Calculate profit percentage
  const calculateProfitPercentage = (item: InventoryItem) => {
    if (!item.purchasePrice || !item.sold_price || item.purchasePrice === 0) return 0;
    return ((item.sold_price - item.purchasePrice) / item.purchasePrice) * 100;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Date Sold</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Sold Price</TableHead>
            <TableHead>Profit</TableHead>
            <TableHead>Marketplace</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No sold items found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const profitPercentage = calculateProfitPercentage(item);
              const isProfit = item.profit && item.profit > 0;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-8 w-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.weapon}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(item.date_sold)}</TableCell>
                  <TableCell>{formatPrice(item.purchasePrice || 0)}</TableCell>
                  <TableCell>{formatPrice(item.sold_price || 0)}</TableCell>
                  <TableCell>
                    <span className={isProfit ? "text-green-500" : "text-red-500"}>
                      {formatPrice(item.profit || 0)}
                      <span className="text-xs ml-1">
                        ({profitPercentage > 0 ? "+" : ""}{profitPercentage.toFixed(1)}%)
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>{item.sold_marketplace || "Unknown"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
