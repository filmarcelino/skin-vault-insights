
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Lock, Trash2 } from "lucide-react";
import { getRarityColor } from "@/utils/skin-utils";

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
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  // Get metallic background style based on rarity
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
      border: 'none',
      borderRadius: '12px',
      overflow: 'hidden',
      ...style
    };
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] ${className} cursor-pointer`}
      onClick={onClick}
      style={getBackgroundStyle()}
    >
      <div className="p-3 flex flex-col h-full">
        {/* Center the image */}
        <div className="relative flex-1 aspect-[16/9] flex items-center justify-center mb-3">
          {image ? (
            <img 
              src={image} 
              alt={`${weaponName} ${skinName}`}
              className="max-h-full max-w-full object-contain transform transition-transform group-hover:scale-110"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="text-[10px] text-white/70">No image</div>
          )}
          
          {tradeLockDays && tradeLockDays > 0 && (
            <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
              <Lock className="h-3 w-3 text-yellow-500" />
            </div>
          )}
        </div>

        {/* Weapon Name and Info at the bottom */}
        <div className="mt-auto">
          <h3 className="font-bold text-xl text-white truncate mb-0.5">
            {skinName}
          </h3>
          <p className="text-sm text-white/80 truncate mb-1">
            {weaponName}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/90">
              {rarity || wear}
            </span>
            
            {price && (
              <span className="text-xs font-semibold text-white">
                ${typeof price === 'number' ? price.toFixed(2) : price}
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
