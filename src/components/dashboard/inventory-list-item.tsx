
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
    
    const metallicColors: Record<string, { main: string, dark: string }> = {
      'Consumer Grade': { main: '#8E9196', dark: '#6a6d71' },
      'Industrial Grade': { main: '#5E7D9A', dark: '#455d72' },
      'Mil-Spec Grade': { main: '#4A6D7C', dark: '#37515c' },
      'Restricted': { main: '#6E5AB0', dark: '#524283' },
      'Classified': { main: '#8A4E9E', dark: '#673976' },
      'Covert': { main: '#9A4A4A', dark: '#733737' },
      'Contraband': { main: '#B8A246', dark: '#8a7934' },
      '★ Rare Special Item': { main: '#A69D7E', dark: '#7d765e' },
      'Comum': { main: '#8E9196', dark: '#6a6d71' },
      'Pouco Comum': { main: '#5E7D9A', dark: '#455d72' },
      'Militar': { main: '#4A6D7C', dark: '#37515c' },
      'Restrita': { main: '#6E5AB0', dark: '#524283' },
      'Classificada': { main: '#8A4E9E', dark: '#673976' },
      'Secreta': { main: '#9A4A4A', dark: '#733737' },
      'Contrabando': { main: '#B8A246', dark: '#8a7934' },
      'Especial Rara': { main: '#A69D7E', dark: '#7d765e' },
      'Extraordinary': { main: '#A69D7E', dark: '#7d765e' },
    };

    const colorSet = metallicColors[rarity] || { 
      main: getRarityColor(rarity), 
      dark: getRarityColor(rarity) 
    };
    
    return {
      background: `linear-gradient(135deg, ${colorSet.main} 0%, ${colorSet.dark} 100%)`,
      boxShadow: `inset 0 0 15px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)`,
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
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent opacity-80 pointer-events-none"></div>
      
      {/* Thumbnail */}
      <div className="h-12 w-12 bg-black/20 rounded flex items-center justify-center shrink-0 relative z-10">
        {image ? (
          <img 
            src={image} 
            alt={`${weaponName} ${skinName}`}
            className="max-h-full max-w-full object-contain"
            onError={handleImageError}
            loading="lazy"
            style={{
              filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))"
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
      {price && <div className="text-sm font-medium whitespace-nowrap text-white relative z-10">
        {typeof price === 'number' ? formatPrice(price) : price}
      </div>}
    </div>
  );
};
