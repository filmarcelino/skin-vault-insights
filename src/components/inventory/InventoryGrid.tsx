
import { useState } from "react";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { InventoryItem } from "@/types/skin";
import { Edit, Heart, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryGridProps {
  isLoading: boolean;
  inventory: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDuplicate: (item: InventoryItem) => void;
  onRemove: (inventoryId: string) => void;
  onSell: (itemId: string, sellData: any) => void;
}

export const InventoryGrid = ({
  isLoading,
  inventory,
  onEdit,
  onDuplicate,
  onRemove,
  onSell,
}: InventoryGridProps) => {
  // Estado para controlar itens favoritos
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
      {inventory.map((item) => (
        <div key={item.inventoryId} className="relative group">
          {/* Botão de favorito */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-20 h-8 w-8 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white rounded-full transition-all"
            onClick={(e) => toggleFavorite(e, item.inventoryId)}
          >
            <Heart 
              className={`h-4 w-4 ${favorites.includes(item.inventoryId) ? "fill-white text-white" : ""}`} 
            />
          </Button>

          {/* Botões de ação na parte inferior que aparecem no hover */}
          <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all">
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-white/10 hover:bg-white/20 text-white text-xs py-1 px-2 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              <Edit className="h-3 w-3 mr-1" /> Editar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-white/10 hover:bg-white/20 text-white text-xs py-1 px-2 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(item);
              }}
            >
              <Copy className="h-3 w-3 mr-1" /> Duplicar
            </Button>
          </div>

          <InventoryCard
            weaponName={item.weapon || ""}
            skinName={item.name}
            wear={item.wear}
            price={item.currentPrice || item.price}
            image={item.image}
            rarity={item.rarity}
            isStatTrak={item.isStatTrak}
            tradeLockDays={item.tradeLockDays}
            tradeLockUntil={item.tradeLockUntil}
            onClick={() => onEdit(item)}
            className="h-full"
          />
        </div>
      ))}
    </div>
  );
};
