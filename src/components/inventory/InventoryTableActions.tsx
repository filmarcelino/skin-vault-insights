
import { MoreVertical, Edit, Copy, Trash2, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { InventoryItem, SellData } from "@/types/skin";

interface InventoryTableActionsProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDuplicate: (item: InventoryItem) => void;
  onRemove: (inventoryId: string) => void;
  onSell: (itemId: string, sellData: SellData) => void;
}

export const InventoryTableActions = ({
  item,
  onEdit,
  onDuplicate,
  onRemove,
  onSell,
}: InventoryTableActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onEdit(item);
        }}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onDuplicate(item);
        }}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicar</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onSell(item.inventoryId, {
              soldPrice: item.currentPrice || item.price || 0,
              soldDate: new Date().toISOString(),
              soldMarketplace: "steam",
              soldFeePercentage: 13,
              soldNotes: "",
              profit: 0,
              soldCurrency: "USD"
            });
          }}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          <span>Vender</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.inventoryId);
          }}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Remover</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
