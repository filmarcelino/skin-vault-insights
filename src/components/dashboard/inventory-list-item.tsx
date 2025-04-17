
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
  
  // Get background style based on rarity
  const getBackgroundStyle = () => {
    if (!rarity) return {};
    
    const metallicColors: Record<string, string> = {
      'Consumer Grade': '#8E9196',
      'Industrial Grade': '#5E7D9A',
      'Mil-Spec Grade': '#4A6D7C',
      'Restricted': '#6E5AB0',
      'Classified': '#8A4E9E',
      'Covert': '#9A4A4A',
      'Contraband': '#B8A246',
      '★ Rare Special Item': '#A69D7E',
      'Comum': '#8E9196',
      'Pouco Comum': '#5E7D9A',
      'Militar': '#4A6D7C',
      'Restrita': '#6E5AB0',
      'Classificada': '#8A4E9E',
      'Secreta': '#9A4A4A',
      'Contrabando': '#B8A246',
      'Especial Rara': '#A69D7E',
    };

    const bgColor = metallicColors[rarity] || getRarityColor(rarity);
    
    return {
      backgroundColor: bgColor,
      boxShadow: `inset 0 0 15px rgba(0,0,0,0.4)`,
      borderLeft: 'none',
      ...style
    };
  };

  // Function to handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <div 
      className={`p-3 flex items-center gap-3 hover:brightness-110 transition-all ${className} ${onClick ? 'cursor-pointer' : ''} rounded-md`}
      style={getBackgroundStyle()}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 bg-black/20 rounded flex items-center justify-center shrink-0">
        {image ? (
          <img 
            src={image} 
            alt={`${weaponName} ${skinName}`}
            className="max-h-full max-w-full object-contain"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="text-xs text-white/50">No image</div>
        )}
      </div>
      
      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <div className="font-medium text-sm truncate text-white">
            {skinName}
            <span className="text-white/70 ml-1">{weaponName}</span>
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
        <div className="flex items-center gap-1 text-xs text-white/70">
          {wear && <span>{wear}</span>}
          {isLocked && daysLeft > 0 && (
            <div className="flex items-center text-[10px] text-yellow-400 ml-1">
              <Lock className="h-3 w-3 mr-0.5" />
              {daysLeft}d
            </div>
          )}
        </div>
      </div>
      
      {/* Price */}
      {price && <div className="text-sm font-medium whitespace-nowrap text-white">
        {typeof price === 'number' ? formatPrice(price) : price}
      </div>}
    </div>
  );
};
