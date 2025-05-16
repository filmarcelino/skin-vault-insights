
import { InventoryItem } from "@/types/skin";
import { SkinCard } from "@/components/inventory/SkinCard";

export interface InventoryGridProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;  // Changed from string to InventoryItem
  onSell: (item: InventoryItem) => void;    // Changed from string to InventoryItem
  onDuplicate: (item: InventoryItem) => void; // Changed from string to InventoryItem
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
          onRemove={() => onDelete(item)}  // Now passing the full item
          onSell={() => onSell(item)}      // Now passing the full item
          onClick={() => onViewDetails(item)}
          className="animate-fade-in transition-transform duration-200"
        />
      ))}
    </div>
  );
};
