
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Lock, Trash2 } from "lucide-react";
import { getRarityColor } from "@/utils/skin-utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface InventoryCardProps {
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

export const InventoryCard: FC<InventoryCardProps> = ({
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
  onDelete,
  showDeleteButton = false,
}) => {
  const { formatPrice } = useCurrency();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  // Get enhanced gradient background style based on rarity
  const getBackgroundStyle = () => {
    if (!rarity) return {};
    
    const metallicColors: Record<string, { main: string, dark: string, light: string }> = {
      'Consumer Grade': { 
        main: '#8E9196', 
        dark: '#6a6d71',
        light: '#a3a7ad'
      },
      'Industrial Grade': { 
        main: '#5E7D9A', 
        dark: '#455d72',
        light: '#7094b3' 
      },
      'Mil-Spec Grade': { 
        main: '#4A6D7C', 
        dark: '#37515c',
        light: '#5d8a9c' 
      },
      'Restricted': { 
        main: '#6E5AB0', 
        dark: '#524283',
        light: '#8a73d0' 
      },
      'Classified': { 
        main: '#8A4E9E', 
        dark: '#673976',
        light: '#a767bf' 
      },
      'Covert': { 
        main: '#9A4A4A', 
        dark: '#733737',
        light: '#b76060' 
      },
      'Contraband': { 
        main: '#B8A246', 
        dark: '#8a7934',
        light: '#d2ba5c' 
      },
      '★ Rare Special Item': { 
        main: '#A69D7E', 
        dark: '#7d765e',
        light: '#bfb599' 
      },
      'Comum': { 
        main: '#8E9196',
        dark: '#6a6d71',
        light: '#a3a7ad'
      },
      'Pouco Comum': { 
        main: '#5E7D9A',
        dark: '#455d72',
        light: '#7094b3'
      },
      'Militar': { 
        main: '#4A6D7C',
        dark: '#37515c',
        light: '#5d8a9c' 
      },
      'Restrita': { 
        main: '#6E5AB0',
        dark: '#524283',
        light: '#8a73d0'
      },
      'Classificada': { 
        main: '#8A4E9E',
        dark: '#673976',
        light: '#a767bf'
      },
      'Secreta': { 
        main: '#9A4A4A',
        dark: '#733737', 
        light: '#b76060'
      },
      'Contrabando': { 
        main: '#B8A246',
        dark: '#8a7934',
        light: '#d2ba5c' 
      },
      'Especial Rara': { 
        main: '#A69D7E',
        dark: '#7d765e',
        light: '#bfb599' 
      },
      'Extraordinary': { 
        main: '#A69D7E',
        dark: '#7d765e',
        light: '#bfb599'
      },
    };

    const colorSet = metallicColors[rarity] || { 
      main: getRarityColor(rarity), 
      dark: getRarityColor(rarity), 
      light: getRarityColor(rarity) 
    };
    
    return {
      background: `linear-gradient(135deg, ${colorSet.dark} 0%, ${colorSet.main} 100%)`,
      boxShadow: `0 8px 20px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.1)`,
      border: 'none',
      borderRadius: '12px',
      overflow: 'hidden',
      ...style
    };
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${className} cursor-pointer`}
      onClick={onClick}
      style={getBackgroundStyle()}
    >
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80"></div>
      
      <div className="p-3 flex flex-col h-full relative z-10">
        {/* Center the image */}
        <div className="relative flex-1 flex items-center justify-center mb-3 py-2">
          {image ? (
            <div className="w-full h-32 flex items-center justify-center overflow-hidden">
              <img 
                src={image} 
                alt={`${weaponName} ${skinName}`}
                className="max-h-full max-w-full object-contain transform transition-transform group-hover:scale-110"
                onError={handleImageError}
                loading="lazy"
                style={{
                  filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          ) : (
            <div className="text-[10px] text-white/70">No image</div>
          )}
          
          {tradeLockDays && tradeLockDays > 0 && (
            <div className="absolute top-1 left-1 bg-black/50 rounded-full p-1">
              <Lock className="h-3 w-3 text-yellow-500" />
            </div>
          )}

          {isStatTrak && (
            <div className="absolute top-1 right-1 bg-[#CF6A32]/80 text-white text-[10px] px-1 py-0.5 rounded">
              StatTrak™
            </div>
          )}
        </div>

        {/* Weapon Name and Info at the bottom */}
        <div className="mt-auto">
          <p className="text-sm text-white/80 truncate mb-0.5">
            {weaponName}
          </p>
          <h3 className="font-bold text-base text-white truncate mb-0.5">
            {skinName}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/90">
              {wear || rarity}
            </span>
            
            {price && (
              <span className="text-xs font-semibold text-white">
                {typeof price === 'number' ? formatPrice(price) : price}
              </span>
            )}
          </div>
        </div>
      </div>

      {showDeleteButton && onDelete && (
        <div 
          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1 px-2.5 rounded-md flex items-center"
            onClick={() => onDelete()}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
};
