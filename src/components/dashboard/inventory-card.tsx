
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Lock, Clock, Trash2 } from "lucide-react";
import { getRarityColor, getRarityColorClass } from "@/utils/skin-utils";
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
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  // Função para obter a cor de fundo baseada na raridade - cores mais sólidas
  const getBackgroundStyle = () => {
    if (!rarity) return {};
    
    let color = getRarityColor(rarity);
    let bgColor = color;
    
    // Mapeamento de raridades para cores sólidas conforme a lista fornecida
    const solidColors: Record<string, string> = {
      'Consumer Grade': '#B0C3D9',
      'Industrial Grade': '#5E98D9',
      'Mil-Spec Grade': '#4B69FF',
      'Restricted': '#8847FF',
      'Classified': '#D32CE6',
      'Covert': '#EB4B4B',
      'Contraband': '#FFD700',
      '★ Rare Special Item': '#FFF99B',
      // PT-BR translations
      'Comum': '#B0C3D9',
      'Pouco Comum': '#5E98D9',
      'Militar': '#4B69FF',
      'Restrita': '#8847FF',
      'Classificada': '#D32CE6',
      'Secreta': '#EB4B4B',
      'Contrabando': '#FFD700',
      'Especial Rara': '#FFF99B',
    };

    if (solidColors[rarity]) {
      bgColor = solidColors[rarity];
    }
    
    return {
      backgroundColor: `${bgColor}`,
      borderColor: `${color}`,
      color: '#000', // Texto preto para melhor contraste com cores claras
      ...style
    };
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-lg border border-2 transition-all duration-300 hover:scale-[1.02] ${className} cursor-pointer`}
      onClick={onClick}
      style={getBackgroundStyle()}
    >
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-xs text-foreground/90 truncate">
              {isStatTrak && (
                <span className="text-[#CF6A32] font-bold mr-1">StatTrak™</span>
              )}
              {weaponName}
            </h3>
            <p className="text-[10px] text-foreground/80 truncate">{skinName}</p>
          </div>
          {price && (
            <span className="text-xs font-semibold bg-background/80 px-1.5 py-0.5 rounded shadow-sm">
              ${price}
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative aspect-[16/9] flex items-center justify-center bg-black/30 rounded overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt={`${weaponName} ${skinName}`}
              className="w-full h-full object-contain transform scale-90 transition-transform group-hover:scale-100"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="text-[10px] text-foreground/80">No image</div>
          )}
          
          {tradeLockDays && tradeLockDays > 0 && (
            <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1">
              <Lock className="h-3 w-3 text-yellow-500" />
            </div>
          )}
        </div>

        {/* Footer - sempre exibir o wear se disponível */}
        <div className="flex items-center justify-between">
          {wear && (
            <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 bg-background/80 text-foreground font-medium shadow-sm">
              {wear}
            </Badge>
          )}
        </div>
      </div>

      {/* Delete overlay */}
      {showDeleteButton && onDelete && (
        <div 
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Button 
            variant="destructive"
            size="sm"
            className="text-[10px] py-1 px-2 h-7"
            onClick={() => onDelete()}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};
