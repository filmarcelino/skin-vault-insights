
import { MoreVertical, Edit, Copy, Trash2, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { InventoryItem, SellData } from "@/types/skin";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{t("common.openMenu")}</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onEdit(item);
        }}>
          <Edit className="mr-2 h-4 w-4" />
          <span>{t("common.edit")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onDuplicate(item);
        }}>
          <Copy className="mr-2 h-4 w-4" />
          <span>{t("common.duplicate")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // Just open the sell modal, don't directly trigger selling
            onEdit(item);
          }}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          <span>{t("inventory.sell")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.inventoryId || item.id);
          }}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>{t("common.remove")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
