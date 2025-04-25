
import { FC, ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
  image?: string;
  style?: React.CSSProperties;
}

export const StatsCard: FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  className = "",
  image,
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Formatação dos números para exibir no máximo 2 casas decimais
  const formatNumber = (val: string | number): string => {
    if (typeof val === 'string') {
      // Se já for uma string, verifica se inclui um símbolo de moeda
      if (val.startsWith('$') || val.startsWith('€') || val.startsWith('¥')) {
        const currencySymbol = val.charAt(0);
        const numericPart = parseFloat(val.substring(1).replace(/,/g, ''));
        if (!isNaN(numericPart)) {
          return `${currencySymbol}${numericPart.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0
          })}`;
        }
      }
      // Tenta converter para número e formatar
      const num = parseFloat(val.replace(/[^\d.-]/g, ''));
      if (!isNaN(num)) {
        return num.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0
        });
      }
      return val;
    } else if (typeof val === 'number') {
      // Se for um número, formata com no máximo 2 casas decimais
      return val.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      });
    }
    return String(val);
  };
  
  return (
    <Card className={cn("p-4 overflow-hidden", className)} style={style}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{formatNumber(value)}</span>
            {trend !== undefined && (
              <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {trend > 0 ? '+' : ''}{formatNumber(trend)}%
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          {trendLabel && <p className="mt-1 text-xs font-medium text-muted-foreground">{trendLabel}</p>}
        </div>
        {icon && <div className="p-2 bg-secondary/40 rounded-md">{icon}</div>}
      </div>
      
      {/* Image Display */}
      {image && !imageError && (
        <div className="mt-3 flex justify-center">
          <img 
            src={image} 
            alt={`${title} image`} 
            className="h-16 object-contain rounded" 
            onError={handleImageError}
          />
        </div>
      )}
    </Card>
  );
};
