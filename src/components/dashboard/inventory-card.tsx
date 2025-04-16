
import { FC } from "react";

interface InventoryCardProps {
  weaponName: string;
  skinName: string;
  wear?: string;
  price?: string | number;
  image?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const InventoryCard: FC<InventoryCardProps> = ({
  weaponName,
  skinName,
  wear = "",
  price,
  image,
  className = "",
  style,
}) => {
  return (
    <div className={`cs-card p-3 flex flex-col ${className}`} style={style}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm">
          {weaponName} | <span className="text-primary">{skinName}</span>
        </div>
      </div>
      {image && (
        <div className="relative w-full h-24 mb-2 flex items-center justify-center">
          <img 
            src={image} 
            alt={`${weaponName} ${skinName}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
      <div className="flex items-center justify-between mt-auto">
        {wear && <div className="text-xs text-muted-foreground">{wear}</div>}
        {price && <div className="text-sm font-medium">${price}</div>}
      </div>
    </div>
  );
};
