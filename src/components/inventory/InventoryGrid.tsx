
import { InventoryItem, SellData } from "@/types/skin";
import { SkinCard } from "@/components/inventory/SkinCard";

export interface InventoryGridProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (inventoryId: string) => void;
  onSell: (itemId: string, sellData: SellData) => void;
  onDuplicate: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  items,
  onEdit,
  onDelete,
  onSell,
  onDuplicate,
  onViewDetails,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <SkinCard
          key={item.inventoryId || item.id}
          item={item}
          onEdit={() => onEdit(item)}
          onDuplicate={() => onDuplicate(item)}
          onRemove={() => onDelete(item.id)}
          onSell={(itemId, sellData) => onSell(itemId, sellData)}
          onClick={() => onViewDetails(item)}
          className="animate-fade-in transition-transform duration-200"
        />
      ))}
    </div>
  );
};
