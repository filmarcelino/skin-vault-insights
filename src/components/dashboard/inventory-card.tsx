
import { FC } from "react";
import { Badge } from "@/components/ui/badge";

interface InventoryCardProps {
  weaponName: string;
  skinName: string;
  wear?: string;
  price?: string | number;
  image?: string;
  className?: string;
  style?: React.CSSProperties;
  rarity?: string;
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
}) => {
  // Function to handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  // Get background color class based on rarity
  const getRarityColorClass = () => {
    if (!rarity) return "";
    
    // Updated colors to match CS:GO/Steam rarity colors
    switch (rarity.toLowerCase()) {
      case "consumer grade":
      case "white":
        return "border-[#B0C3D9] hover:bg-[rgba(176,195,217,0.05)]";
      case "industrial grade":
      case "light blue":
        return "border-[#5E98D9] hover:bg-[rgba(94,152,217,0.05)]";
      case "mil-spec grade":
      case "blue":
        return "border-[#4B69FF] hover:bg-[rgba(75,105,255,0.05)]";
      case "restricted":
      case "purple":
        return "border-[#8847FF] hover:bg-[rgba(136,71,255,0.05)]";
      case "classified":
      case "pink":
        return "border-[#D32CE6] hover:bg-[rgba(211,44,230,0.05)]";
      case "covert":
      case "red":
        return "border-[#EB4B4B] hover:bg-[rgba(235,75,75,0.05)]";
      case "contraband":
      case "gold":
        return "border-[#FFD700] hover:bg-[rgba(255,215,0,0.05)]";
      case "extraordinary":
      case "rare special":
      case "knife":
      case "glove":
        return "border-[#FFF99B] hover:bg-[rgba(255,249,155,0.05)]";
      default:
        return "";
    }
  };

  return (
    <div 
      className={`cs-card p-3 flex flex-col transition-all ${getRarityColorClass()} border-t-2 ${className}`} 
      style={style}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm truncate max-w-full">
          {weaponName} | <span className="text-primary">{skinName}</span>
        </div>
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
      </div>
      <div className="flex items-center justify-between mt-auto">
        {wear && <Badge variant="secondary" className="text-xs truncate max-w-[70%]">{wear}</Badge>}
        {price && <div className="text-sm font-medium">${price}</div>}
      </div>
    </div>
  );
};
