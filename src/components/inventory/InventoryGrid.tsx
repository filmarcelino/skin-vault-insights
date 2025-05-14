
import { useState } from "react";
import { InventoryItem } from "@/types/skin";
import { SkinCard } from "@/components/inventory/SkinCard";
import { useInventoryActions } from "@/hooks/useInventoryActions";

interface InventoryGridProps {
  items: InventoryItem[];
}

export const InventoryGrid = ({ items }: InventoryGridProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { handleEdit, handleDuplicate, handleRemove, handleSell } = useInventoryActions();

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 h-64 text-muted-foreground">
        No skins found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 mt-4">
      {items.map((item) => (
        <SkinCard 
          key={item.inventoryId} 
          item={item}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onRemove={handleRemove}
          onSell={handleSell}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(item.inventoryId)}
          showMetadata={true}
          className="w-full h-full"
        />
      ))}
    </div>
  );
};
