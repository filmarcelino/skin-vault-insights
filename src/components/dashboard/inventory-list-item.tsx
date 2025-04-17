
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
    
    // Create a mapping of rarity to premium metallic color gradients
    const metallicColors: Record<string, { light: string, main: string, dark: string, accent: string }> = {
      'Consumer Grade': { light: '#a1a5ad', main: '#8E9196', dark: '#6a6d71', accent: '#ffffff30' },
      'Industrial Grade': { light: '#7a9cc9', main: '#5E7D9A', dark: '#455d72', accent: '#c0e6ff30' },
      'Mil-Spec Grade': { light: '#6a9dab', main: '#4A6D7C', dark: '#37515c', accent: '#add8e630' },
      'Restricted': { light: '#9280d6', main: '#6E5AB0', dark: '#524283', accent: '#e2d7ff30' },
      'Classified': { light: '#ba74d9', main: '#8A4E9E', dark: '#673976', accent: '#f5d0ff30' },
      'Covert': { light: '#c66a6a', main: '#9A4A4A', dark: '#733737', accent: '#ffd0d030' },
      'Contraband': { light: '#e0c457', main: '#B8A246', dark: '#8a7934', accent: '#ffe8a830' },
      '★ Rare Special Item': { light: '#d6ca9d', main: '#A69D7E', dark: '#7d765e', accent: '#ffffb330' },
      'Comum': { light: '#a1a5ad', main: '#8E9196', dark: '#6a6d71', accent: '#ffffff30' },
      'Pouco Comum': { light: '#7a9cc9', main: '#5E7D9A', dark: '#455d72', accent: '#c0e6ff30' },
      'Militar': { light: '#6a9dab', main: '#4A6D7C', dark: '#37515c', accent: '#add8e630' },
      'Restrita': { light: '#9280d6', main: '#6E5AB0', dark: '#524283', accent: '#e2d7ff30' },
      'Classificada': { light: '#ba74d9', main: '#8A4E9E', dark: '#673976', accent: '#f5d0ff30' },
      'Secreta': { light: '#c66a6a', main: '#9A4A4A', dark: '#733737', accent: '#ffd0d030' },
      'Contrabando': { light: '#e0c457', main: '#B8A246', dark: '#8a7934', accent: '#ffe8a830' },
      'Especial Rara': { light: '#d6ca9d', main: '#A69D7E', dark: '#7d765e', accent: '#ffffb330' },
      'Extraordinary': { light: '#d6ca9d', main: '#A69D7E', dark: '#7d765e', accent: '#ffffb330' },
    };
    
    // Default fallback colors
    const defaultColors = { 
      light: '#a1a5ad',
      main: getRarityColor(rarity), 
      dark: '#6a6d71',
      accent: '#ffffff30'
    };

    const colorSet = metallicColors[rarity] || defaultColors;
    
    return {
      background: `linear-gradient(135deg, ${colorSet.main} 0%, ${colorSet.dark} 100%)`,
      boxShadow: `inset 0 0 15px ${colorSet.accent}, 0 2px 8px rgba(0,0,0,0.25)`,
      borderLeft: 'none',
      position: 'relative',
      overflow: 'hidden',
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
      {/* Background shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 opacity-80 pointer-events-none"></div>
      
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
