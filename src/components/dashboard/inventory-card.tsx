
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
    
    // This is a simplified version, you can expand this based on CS:GO rarity colors
    switch (rarity.toLowerCase()) {
      case "consumer grade":
        return "border-gray-400";
      case "industrial grade":
        return "border-blue-400";
      case "mil-spec grade":
        return "border-blue-500";
      case "restricted":
        return "border-purple-500";
      case "classified":
        return "border-pink-500";
      case "covert":
        return "border-red-500";
      case "extraordinary":
      case "contraband":
        return "border-yellow-500";
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
