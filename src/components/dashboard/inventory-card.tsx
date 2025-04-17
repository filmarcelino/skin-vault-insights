
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
  // Function to handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  // Get background color class based on rarity
  const getRarityColorClass = () => {
    if (!rarity) return "";
    
    // Enhanced rarity colors with stronger gradients
    switch (rarity.toLowerCase()) {
      case "consumer grade":
      case "white":
        return "border-[#B0C3D9] hover:bg-[rgba(176,195,217,0.15)] bg-gradient-to-br from-[rgba(176,195,217,0.05)] to-[rgba(176,195,217,0.1)]";
      case "industrial grade":
      case "light blue":
        return "border-[#5E98D9] hover:bg-[rgba(94,152,217,0.15)] bg-gradient-to-br from-[rgba(94,152,217,0.05)] to-[rgba(94,152,217,0.1)]";
      case "mil-spec grade":
      case "blue":
        return "border-[#4B69FF] hover:bg-[rgba(75,105,255,0.15)] bg-gradient-to-br from-[rgba(75,105,255,0.05)] to-[rgba(75,105,255,0.1)]";
      case "restricted":
      case "purple":
        return "border-[#8847FF] hover:bg-[rgba(136,71,255,0.15)] bg-gradient-to-br from-[rgba(136,71,255,0.05)] to-[rgba(136,71,255,0.1)]";
      case "classified":
      case "pink":
        return "border-[#D32CE6] hover:bg-[rgba(211,44,230,0.15)] bg-gradient-to-br from-[rgba(211,44,230,0.05)] to-[rgba(211,44,230,0.1)]";
      case "covert":
      case "red":
        return "border-[#EB4B4B] hover:bg-[rgba(235,75,75,0.15)] bg-gradient-to-br from-[rgba(235,75,75,0.05)] to-[rgba(235,75,75,0.1)]";
      case "contraband":
      case "gold":
        return "border-[#FFD700] hover:bg-[rgba(255,215,0,0.15)] bg-gradient-to-br from-[rgba(255,215,0,0.05)] to-[rgba(255,215,0,0.1)]";
      case "extraordinary":
      case "rare special":
      case "knife":
      case "glove":
        return "border-[#FFF99B] hover:bg-[rgba(255,249,155,0.15)] bg-gradient-to-br from-[rgba(255,249,155,0.05)] to-[rgba(255,249,155,0.1)]";
      default:
        return "";
    }
  };

  // Check if the item is still trade locked
  const isLocked = tradeLockDays && tradeLockDays > 0;
  const tradeLockDate = tradeLockUntil ? new Date(tradeLockUntil) : null;
  const daysLeft = tradeLockDate ? Math.ceil((tradeLockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Get border color based on rarity for glow effect
  const getBorderGlowStyle = () => {
    if (!rarity) return {};
    
    const color = getRarityColor(rarity);
    return {
      boxShadow: `0 0 10px rgba(${hexToRgb(color)}, 0.15)`,
    };
  };
  
  // Helper to convert hex to rgb for shadow
  const hexToRgb = (hex: string): string => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return as RGB string
    return `${r}, ${g}, ${b}`;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <div 
      className={`cs-card p-3 flex flex-col transition-all ${getRarityColorClass()} border-t-2 ${className} ${onClick ? 'cursor-pointer' : ''}`} 
      style={{...style, ...getBorderGlowStyle()}}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm truncate max-w-full">
          {weaponName} | <span className="text-primary">{skinName}</span>
        </div>
        {isStatTrak && (
          <Badge 
            variant="outline" 
            className="ml-1 text-[10px] py-0 h-4 bg-[#CF6A32]/10 text-[#CF6A32] border-[#CF6A32]/30"
          >
            ST™
          </Badge>
        )}
      </div>

      <div className="relative w-full h-24 mb-2 flex items-center justify-center bg-black/10 dark:bg-white/5 rounded">
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
        
        {/* Trade lock indicator */}
        {isLocked && daysLeft > 0 && (
          <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1 flex items-center">
            <Lock className="h-3 w-3 text-yellow-500" />
          </div>
        )}

        {/* Delete button overlay */}
        {showDeleteButton && onDelete && (
          <div 
            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-1"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-3.5 w-3.5" /> Remover
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1">
          {wear && <Badge variant="secondary" className="text-xs truncate max-w-[70%]">{wear}</Badge>}
          {isLocked && daysLeft > 0 && (
            <div className="flex items-center text-[10px] text-yellow-500">
              <Clock className="h-3 w-3 mr-0.5" />
              {daysLeft}d
            </div>
          )}
        </div>
        {price && <div className="text-sm font-medium">${price}</div>}
      </div>
    </div>
  );
};
