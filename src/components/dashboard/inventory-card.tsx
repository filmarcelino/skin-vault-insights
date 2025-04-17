import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Lock, Clock, Trash2 } from "lucide-react";
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

  const getRarityColorClass = () => {
    if (!rarity) return "";
    
    switch (rarity.toLowerCase()) {
      case "consumer grade":
      case "white":
        return "from-[#B0C3D9]/10 to-[#B0C3D9]/20 border-[#B0C3D9]/50";
      case "industrial grade":
      case "light blue":
        return "from-[#5E98D9]/10 to-[#5E98D9]/20 border-[#5E98D9]/50";
      case "mil-spec grade":
      case "blue":
        return "from-[#4B69FF]/10 to-[#4B69FF]/20 border-[#4B69FF]/50";
      case "restricted":
      case "purple":
        return "from-[#8847FF]/10 to-[#8847FF]/20 border-[#8847FF]/50";
      case "classified":
      case "pink":
        return "from-[#D32CE6]/10 to-[#D32CE6]/20 border-[#D32CE6]/50";
      case "covert":
      case "red":
        return "from-[#EB4B4B]/10 to-[#EB4B4B]/20 border-[#EB4B4B]/50";
      default:
        return "from-gray-500/10 to-gray-500/20 border-gray-500/50";
    }
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-lg bg-gradient-to-br ${getRarityColorClass()} border transition-all duration-300 hover:scale-[1.02] ${className} cursor-pointer`}
      onClick={onClick}
      style={style}
    >
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-xs text-foreground/90 truncate">
              {isStatTrak && (
                <span className="text-[#CF6A32] font-bold mr-1">StatTrak™</span>
              )}
              {weaponName}
            </h3>
            <p className="text-[10px] text-primary truncate">{skinName}</p>
          </div>
          {price && (
            <span className="text-xs font-semibold bg-background/40 px-1.5 py-0.5 rounded">
              ${price}
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative aspect-[16/9] flex items-center justify-center bg-black/20 rounded overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt={`${weaponName} ${skinName}`}
              className="w-full h-full object-contain transform scale-90 transition-transform group-hover:scale-100"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="text-[10px] text-muted-foreground">No image</div>
          )}
          
          {tradeLockDays && tradeLockDays > 0 && (
            <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1">
              <Lock className="h-3 w-3 text-yellow-500" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {wear && (
            <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5">
              {wear}
            </Badge>
          )}
        </div>
      </div>

      {/* Delete overlay */}
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
