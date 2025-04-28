
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/types/skin";
import { InventoryTableActions } from "./InventoryTableActions";
import { useCurrency } from "@/contexts/CurrencyContext";

interface InventoryTableProps {
  isLoading: boolean;
  inventory: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDuplicate: (item: InventoryItem) => void;
  onRemove: (inventoryId: string) => void;
  onSell: (itemId: string, sellData: any) => void;
}

export const InventoryTable = ({
  isLoading,
  inventory,
  onEdit,
  onDuplicate,
  onRemove,
  onSell,
}: InventoryTableProps) => {
  const { formatPrice } = useCurrency();

  return (
    <ScrollArea className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Imagem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Arma</TableHead>
            <TableHead>Raridade</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Carregando inventário...
              </TableCell>
            </TableRow>
          ) : inventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Nenhuma skin encontrada.
              </TableCell>
            </TableRow>
          ) : (
            inventory.map((item) => (
              <TableRow key={item.inventoryId} className="cursor-pointer" onClick={() => onEdit(item)}>
                <TableCell className="font-medium">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-auto rounded-md"
                  />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.weapon}</TableCell>
                <TableCell>
                  <Badge>{item.rarity}</Badge>
                </TableCell>
                <TableCell>
                  {formatPrice(item.currentPrice || item.price || 0)}
                </TableCell>
                <TableCell className="text-right">
                  <InventoryTableActions 
                    item={item} 
                    onEdit={onEdit} 
                    onDuplicate={onDuplicate} 
                    onRemove={onRemove} 
                    onSell={onSell} 
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
