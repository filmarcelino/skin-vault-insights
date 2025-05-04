
import { useState } from "react";
import { InventoryItem } from "@/types/skin";
import { SkinListItem } from "./SkinListItem";

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
  // Estado para controlar itens favoritos
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 h-64 text-muted-foreground">
        Carregando inventário...
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 h-64 text-muted-foreground">
        Nenhuma skin encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {inventory.map((item) => (
        <SkinListItem 
          key={item.inventoryId} 
          item={item}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          onSell={onSell}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(item.inventoryId)}
        />
      ))}
    </div>
  );
};
