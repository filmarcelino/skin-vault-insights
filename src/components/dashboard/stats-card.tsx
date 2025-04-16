
import { FC, ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StatsCard: FC<StatsCardProps> = ({
  title,
  value,
  icon,
  className = "",
  style,
}) => {
  return (
    <div className={`cs-card p-4 flex flex-col ${className}`} style={style}>
      <div className="flex items-center justify-between">
        {icon && <div className="text-primary mb-2">{icon}</div>}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
    </div>
  );
};
