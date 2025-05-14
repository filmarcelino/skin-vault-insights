
import { useState } from "react";
import { InventoryItem } from "@/types/skin";
import { SkinListItem } from "./SkinListItem";
import { useInventoryActions } from "@/hooks/useInventoryActions";

interface InventoryTableProps {
  items: InventoryItem[];
}

export const InventoryTable = ({ items }: InventoryTableProps) => {
  // Estado para controlar itens favoritos
  const [favorites, setFavorites] = useState<string[]>([]);
  const { 
    handleEdit, 
    handleDuplicate, 
    handleRemove, 
    handleSell 
  } = useInventoryActions();

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
    <div className="space-y-2 mt-4 w-full">
      {items.map((item) => (
        <SkinListItem 
          key={item.inventoryId} 
          item={item}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onRemove={handleRemove}
          onSell={handleSell}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(item.inventoryId)}
          showMetadata={true}
        />
      ))}
    </div>
  );
};
