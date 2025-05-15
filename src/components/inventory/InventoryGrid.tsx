
import { InventoryItem, SellData } from "@/types/skin";
import { InventoryCard } from "@/components/dashboard/inventory-card";

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
        <InventoryCard
          key={item.inventoryId}
          weaponName={item.weapon || ''}
          skinName={item.name}
          wear={item.wear || ''}
          price={item.currentPrice || item.price || 0}
          image={item.image}
          rarity={item.rarity}
          isStatTrak={item.isStatTrak}
          tradeLockDays={item.tradeLockDays}
          tradeLockUntil={item.tradeLockUntil}
          onClick={() => onViewDetails(item)}
          onDelete={() => onDelete(item.id)}
          showDeleteButton={true}
          purchasePrice={item.purchasePrice}
        />
      ))}
    </div>
  );
};
