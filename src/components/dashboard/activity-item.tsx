
import { FC, ReactNode } from "react";

type ActivityType = "add" | "sell" | "trade" | "purchase" | string;

interface ActivityItemProps {
  type: ActivityType;
  weaponName: string;
  skinName: string;
  date: string;
  price?: string | number;
  icon?: ReactNode;
  className?: string;
}

export const ActivityItem: FC<ActivityItemProps> = ({
  type,
  weaponName,
  skinName,
  date,
  price,
  icon,
  className = "",
}) => {
  const getTypeColor = () => {
    switch (type) {
      case "add": return "text-green-500";
      case "sell": return "text-red-500";
      case "trade": return "text-blue-500";
      case "purchase": return "text-purple-500";
      default: return "text-muted-foreground";
    }
  };
  
  const getTypeLabel = () => {
    switch (type) {
      case "add": return "Add";
      case "sell": return "Sold";
      case "trade": return "Traded";
      case "purchase": return "Purchased";
      default: return "";
    }
  };

  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`${getTypeColor()} text-sm`}>
          {icon || getTypeLabel()}
        </div>
        <div>
          <div className="font-medium">
            {weaponName} | {skinName}
          </div>
          <div className="text-xs text-muted-foreground">{date}</div>
        </div>
      </div>
      {price && (
        <div className="font-medium">
          ${price}
        </div>
      )}
    </div>
  );
};
