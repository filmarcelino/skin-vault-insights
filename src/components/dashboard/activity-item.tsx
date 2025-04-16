
import { FC, ReactNode } from "react";
import { format } from "date-fns";

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

  // Format the date to "Month Day, Year" format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) return dateString;
      
      // Format: May 3rd, 2023
      const day = date.getDate();
      const suffix = getDaySuffix(day);
      
      return format(date, `MMMM d'${suffix}', yyyy`);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };
  
  // Helper to get day suffix (st, nd, rd, th)
  const getDaySuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
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
          <div className="text-xs text-muted-foreground">{formatDate(date)}</div>
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
