import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Lock, Trash2 } from "lucide-react";
import { getRarityColor } from "@/utils/skin-utils";
import { Button } from "@/components/ui/button";

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
      color: '#000000',
      border: 'none',
      ...style
    };
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] ${className} cursor-pointer`}
      onClick={onClick}
      style={getBackgroundStyle()}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-xs text-black/90 truncate">
              {isStatTrak && (
                <span className="text-[#CF6A32] font-bold mr-1">StatTrak™</span>
              )}
              {weaponName}
            </h3>
            <p className="text-[10px] text-black/80 truncate">{skinName}</p>
          </div>
          {price && (
            <span className="text-xs font-semibold bg-transparent px-1.5 py-0.5 rounded text-black">
              ${price}
            </span>
          )}
        </div>

        <div className="relative aspect-[16/9] flex items-center justify-center bg-black/30 rounded overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt={`${weaponName} ${skinName}`}
              className="w-full h-full object-contain transform scale-90 transition-transform group-hover:scale-100"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="text-[10px] text-foreground/80">No image</div>
          )}
          
          {tradeLockDays && tradeLockDays > 0 && (
            <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1">
              <Lock className="h-3 w-3 text-yellow-500" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {wear && (
            <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 bg-background/80 text-foreground font-medium shadow-sm">
              {wear}
            </Badge>
          )}
        </div>
      </div>

      {showDeleteButton && onDelete && (
        <div 
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Button 
            variant="destructive"
            size="sm"
            className="text-[10px] py-1 px-2 h-7"
            onClick={() => onDelete()}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};
