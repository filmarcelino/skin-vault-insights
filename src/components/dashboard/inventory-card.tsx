
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
        return "border-[#B0C3D9]";
      case "industrial grade":
      case "light blue":
        return "border-[#5E98D9]";
      case "mil-spec grade":
      case "blue":
        return "border-[#4B69FF]";
      case "restricted":
      case "purple":
        return "border-[#8847FF]";
      case "classified":
      case "pink":
        return "border-[#D32CE6]";
      case "covert":
      case "red":
        return "border-[#EB4B4B]";
      case "contraband":
      case "gold":
        return "border-[#FFD700]";
      case "extraordinary":
      case "rare special":
      case "knife":
      case "glove":
        return "border-[#FFF99B]";
      default:
        return "";
    }
  };

  return (
    <div className={`cs-card p-3 flex flex-col ${getRarityColorClass()} border-t-2 ${className}`} style={style}>
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
