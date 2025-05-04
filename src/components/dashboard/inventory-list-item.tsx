
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { getRarityColor, getTradeLockStatus } from "@/utils/skin-utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { InventoryItem } from "@/types/skin";

interface InventoryListItemProps {
  weaponName: string;
  skinName: string;
  wear?: string;
  price?: string | number;
  image?: string;
  className?: string;
  style?: React.CSSProperties;
  rarity?: string;
  isStatTrak?: boolean;
  tradeLockDays?: number;
  tradeLockUntil?: string;
  onClick?: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export const InventoryListItem: FC<InventoryListItemProps> = ({
  weaponName,
  skinName,
  wear = "",
  price,
  image,
  className = "",
  style,
  rarity,
  isStatTrak,
  tradeLockDays,
  tradeLockUntil,
  onClick,
}) => {
  const { formatPrice } = useCurrency();
  const { isLocked, daysLeft } = getTradeLockStatus(tradeLockUntil);
  
  // Get enhanced gradient background style based on rarity
  const getBackgroundStyle = () => {
    if (!rarity) return {};
    
    const rarityColor = getRarityColor(rarity);
    
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
      WebkitBackdropFilter: 'blur(8px)',
      ...style
    };
  };

  // Function to handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <div 
      className={`p-3 flex items-center gap-3 hover:brightness-110 transition-all relative ${className} ${onClick ? 'cursor-pointer' : ''} rounded-md`}
      style={getBackgroundStyle()}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 bg-black/30 rounded flex items-center justify-center shrink-0 relative z-10 border border-white/10">
        {image ? (
          <img 
            src={image} 
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
      </div>
      
      {/* Main info */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-1">
          <div className="font-medium text-sm truncate text-white">
            {skinName}
            <span className="text-white/80 ml-1">{weaponName}</span>
          </div>
          {isStatTrak && (
            <Badge 
              variant="outline" 
              className="text-[10px] py-0 h-4 bg-[#CF6A32]/20 text-[#FFC89F] border-[#CF6A32]/50"
            >
              ST™
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-white/80">
          {wear && <span>{wear}</span>}
          {isLocked && daysLeft > 0 && (
            <div className="flex items-center text-[10px] text-yellow-300 ml-1">
              <Lock className="h-3 w-3 mr-0.5" />
              {daysLeft}d
            </div>
          )}
        </div>
      </div>
      
      {/* Price */}
      {price && <div className="text-sm font-medium whitespace-nowrap text-white relative z-10">
        {typeof price === 'number' ? formatPrice(price) : price}
      </div>}
    </div>
  );
};
