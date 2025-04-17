import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Lock, Clock } from "lucide-react";
import { getRarityColor } from "@/utils/skin-utils";
import { InventoryItem } from "@/types/skin";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  
  // Get border color based on rarity
  const getBorderStyle = () => {
    if (!rarity) return {};
    
    const color = getRarityColor(rarity);
    return {
      borderLeftColor: color,
      backgroundColor: `${color}10`, // Light background based on rarity
      ...style
    };
  };

  // Function to handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <div 
      className={`border-l-4 p-3 flex items-center gap-3 hover:bg-accent/20 transition-colors ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={getBorderStyle()}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 bg-black/10 dark:bg-white/5 rounded flex items-center justify-center shrink-0">
        {image ? (
          <img 
            src={image} 
            alt={`${weaponName} ${skinName}`}
            className="max-h-full max-w-full object-contain"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="text-xs text-muted-foreground">No image</div>
        )}
      </div>
      
      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <div className="font-medium text-sm truncate text-black">
            {weaponName} | <span className="text-black/70">{skinName}</span>
          </div>
          {isStatTrak && (
            <Badge 
              variant="outline" 
              className="text-[10px] py-0 h-4 bg-[#CF6A32]/10 text-[#CF6A32] border-[#CF6A32]/30"
            >
              ST™
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-black/60">
          {wear && <span>{wear}</span>}
          {isLocked && daysLeft > 0 && (
            <div className="flex items-center text-[10px] text-yellow-500 ml-1">
              <Lock className="h-3 w-3 mr-0.5" />
              {daysLeft}d
            </div>
          )}
        </div>
      </div>
      
      {/* Price */}
      {price && <div className="text-sm font-medium whitespace-nowrap text-black">
        {typeof price === 'number' ? formatPrice(price) : price}
      </div>}
    </div>
  );
};
