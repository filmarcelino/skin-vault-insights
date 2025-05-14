
import React from "react";
import { InventoryItem } from "@/types/skin";
import { Badge } from "@/components/ui/badge";
import { Heart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { InventoryTableActions } from "./InventoryTableActions";
import { getRarityColor, getTradeLockStatus } from "@/utils/skin-utils";

interface SkinListItemProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDuplicate?: (item: InventoryItem) => void;
  onRemove?: (itemId: string) => void;
  onSell?: (itemId: string, sellData: any) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (itemId: string) => void;
  showMetadata?: boolean;
  onClick?: () => void;
  className?: string; // Added className prop
}

export const SkinListItem = ({
  item,
  onEdit,
  onDuplicate,
  onRemove,
  onSell,
  isFavorite = false,
  onToggleFavorite,
  showMetadata = false,
  onClick,
  className = "", // Added default value
}: SkinListItemProps) => {
  const { formatPrice } = useCurrency();
  const { isLocked, daysLeft } = getTradeLockStatus(item.tradeLockUntil);
  
  // Safe access to properties
  const weaponName = item.weapon || "Unknown";
  const skinName = item.name || "Unknown Skin";
  const wear = item.wear || "";
  const price = item.currentPrice ?? item.price ?? 0;
  
  // Get background style based on rarity
  const getBackgroundStyle = () => {
    if (!item.rarity) return {};
    
    const rarityColor = getRarityColor(item.rarity);
    
    // Convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return {
      background: `linear-gradient(135deg, ${hexToRgba(rarityColor, 0.15)} 0%, transparent 100%)`,
      borderLeft: `3px solid ${hexToRgba(rarityColor, 0.7)}`,
      boxShadow: `0 2px 10px ${hexToRgba(rarityColor, 0.1)}`,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    };
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div 
      className="p-3 flex items-center gap-3 transition-all duration-200 hover:bg-accent/50 rounded-md cursor-pointer"
      style={getBackgroundStyle()}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 bg-black/30 rounded flex items-center justify-center shrink-0 relative z-10 border border-white/10">
        {item.image ? (
          <img 
            src={item.image} 
            alt={`${weaponName} ${skinName}`}
            className="max-h-full max-w-full object-contain"
            onError={handleImageError}
            loading="lazy"
            style={{
              filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.4))"
            }}
          />
        ) : (
          <div className="text-xs text-white/50">No image</div>
        )}
        
        {/* Trade lock icon on thumbnail */}
        {isLocked && daysLeft > 0 && (
          <div className="absolute top-0 left-0 bg-black/70 rounded-bl-md rounded-tr-md p-0.5 flex items-center">
            <Lock className="h-2.5 w-2.5 text-yellow-500" />
            <span className="text-[8px] ml-0.5 text-yellow-500">{daysLeft}d</span>
          </div>
        )}
      </div>
      
      {/* Main info */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-1">
          <div className="font-medium text-sm truncate text-[#F0F0F0]">
            {skinName}
            <span className="text-[#A3A3A3] ml-1">{weaponName}</span>
          </div>
          {item.isStatTrak && (
            <Badge 
              variant="outline" 
              className="text-[10px] py-0 h-4 bg-[#CF6A32]/20 text-[#FFC89F] border-[#CF6A32]/50"
            >
              ST™
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-[#A3A3A3]">
          {wear && <span>{wear}</span>}
          {showMetadata && (
            <>
              {item.floatValue && (
                <span className="ml-2 font-mono text-[10px] opacity-70">
                  {item.floatValue.toFixed(4)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Favorite button */}
      {onToggleFavorite && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full p-0 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.inventoryId);
          }}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`} 
          />
        </Button>
      )}
      
      {/* Price */}
      <div className="text-sm font-medium whitespace-nowrap text-[#F0F0F0] relative z-10">
        {formatPrice(price)}
      </div>
      
      {/* Actions */}
      {(onEdit || onDuplicate || onRemove || onSell) && (
        <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
          <InventoryTableActions 
            item={item}
            onEdit={onEdit} 
            onDuplicate={onDuplicate}
            onRemove={onRemove}
            onSell={onSell}
          />
        </div>
      )}
    </div>
  );
};
