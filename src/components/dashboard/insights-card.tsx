
import { FC } from "react";
import { Lightbulb } from "lucide-react";

interface InsightsCardProps {
  message: string;
  className?: string;
  style?: React.CSSProperties;
}

export const InsightsCard: FC<InsightsCardProps> = ({
  message,
  className = "",
  style,
}) => {
  return (
    <div className={`cs-insights-card p-4 flex items-start gap-3 ${className}`} style={style}>
      <Lightbulb className="h-6 w-6 text-primary shrink-0 mt-0.5" />
      <div>
        <div className="font-medium mb-1">Insights</div>
        <div className="text-sm">{message}</div>
      </div>
    </div>
  );
};
