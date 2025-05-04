
import React from "react";
import { InventoryItem } from "@/types/skin";
import { Edit, Heart, Lock, Trash2, DollarSign, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import { getRarityColor } from "@/utils/skin-utils";

interface SkinListItemProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDuplicate?: (item: InventoryItem) => void;
  onRemove?: (itemId: string) => void;
  onSell?: (itemId: string, sellData: any) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (itemId: string) => void;
  className?: string;
  showMetadata?: boolean;
  onClick?: () => void;
}

export const SkinListItem = ({
  item,
  onEdit,
  onDuplicate,
  onRemove,
  onSell,
  isFavorite = false,
  onToggleFavorite,
  className,
  showMetadata = false,
  onClick,
}: SkinListItemProps) => {
  const { formatPrice } = useCurrency();

  // Função para gerar o gradiente de cor baseado na raridade
  const getBackgroundGradient = () => {
    const rarityColor = getRarityColor(item.rarity || '');
    
    // Convertemos a cor hex para rgba para poder aplicar transparência
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    return {
      background: `linear-gradient(135deg, ${hexToRgba(rarityColor, 0.1)} 0%, transparent 100%)`,
      borderLeft: `3px solid ${hexToRgba(rarityColor, 0.7)}`,
      boxShadow: `0 2px 10px ${hexToRgba(rarityColor, 0.1)}`,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    };
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg w-full transition-all duration-300 hover:brightness-110",
        className
      )}
      style={getBackgroundGradient()}
      onClick={onClick}
    >
      {/* Conteúdo do item */}
      <div className="relative flex items-center p-3 gap-3">
        {/* Imagem */}
        <div className="h-16 w-16 bg-black/20 rounded flex items-center justify-center shrink-0 overflow-hidden backdrop-blur-sm">
          {item.image ? (
            <img
              src={item.image}
              alt={`${item.weapon} | ${item.name}`}
              className="max-h-full max-w-full object-contain"
              onError={handleImageError}
              loading="lazy"
              style={{
                filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
              }}
            />
          ) : (
            <span className="text-xs text-white/50">No image</span>
          )}
        </div>

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-white truncate">{item.name}</h2>
            {item.isStatTrak && (
              <span className="bg-[#CF6A32]/50 text-white text-[10px] px-1 py-0.5 rounded">
                StatTrak™
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-white/80">{item.weapon}</span>
            <span className="text-white/80">{item.wear || "Factory New"}</span>
            {item.floatValue !== undefined && (
              <span className="text-white/70 text-xs">{item.floatValue.toFixed(2)}</span>
            )}
            {item.tradeLockDays && item.tradeLockDays > 0 && (
              <div className="flex items-center gap-1 text-yellow-300">
                <Lock className="h-3 w-3" />
                <span className="text-xs">{item.tradeLockDays}d</span>
              </div>
            )}
          </div>
        </div>

        {/* Preço e ações */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {item.currentPrice ? formatPrice(item.currentPrice) : (
                item.price ? formatPrice(item.price) : ""
              )}
            </div>
            {showMetadata && item.purchasePrice && (
              <div className="text-xs text-white/70">
                Bought: {formatPrice(item.purchasePrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.inventoryId);
                }}
              >
                <Heart 
                  className={`h-4 w-4 ${isFavorite ? "fill-white text-white" : ""}`} 
                />
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onDuplicate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(item);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.inventoryId);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
