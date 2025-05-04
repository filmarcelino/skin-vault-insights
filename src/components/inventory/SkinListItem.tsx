
import React from "react";
import { InventoryItem } from "@/types/skin";
import { Edit, Heart, Lock, Trash2, DollarSign, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import { getRarityColor } from "@/utils/skin-utils";

interface SkinListItemProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDuplicate?: (item: InventoryItem) => void;
  onRemove?: (itemId: string) => void;
  onSell?: (itemId: string, sellData: any) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (itemId: string) => void;
  className?: string;
  showMetadata?: boolean;
  onClick?: () => void;
}

export const SkinListItem = ({
  item,
  onEdit,
  onDuplicate,
  onRemove,
  onSell,
  isFavorite = false,
  onToggleFavorite,
  className,
  showMetadata = false,
  onClick,
}: SkinListItemProps) => {
  const { formatPrice } = useCurrency();

  // Função para gerar o gradiente de cor baseado na raridade com cores mais vivas
  const getBackgroundGradient = () => {
    const rarityColor = getRarityColor(item.rarity || '');
    
    // Convertemos a cor hex para rgba para poder aplicar transparência
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    // Cores mais vibrantes para cada raridade
    const getEnhancedColor = () => {
      switch ((item.rarity || '').toLowerCase()) {
        case "consumer grade":
        case "white":
        case "comum":
          return '#B8C3D9'; // Ligeiramente mais brilhante
        case "industrial grade":
        case "light blue": 
        case "pouco comum":
          return '#5EA8F9'; // Azul mais vibrante
        case "mil-spec grade":
        case "blue":
        case "militar":
          return '#4B75FF'; // Azul mais vibrante
        case "restricted":
        case "purple":
        case "restrita":
          return '#9A5CFE'; // Roxo mais vibrante
        case "classified":
        case "pink":
        case "classificada":
          return '#F546EF'; // Rosa mais vibrante
        case "covert":
        case "red":
        case "secreta":
        case "rara":
          return '#FF4B4B'; // Vermelho mais vibrante
        case "contraband":
        case "gold":
        case "contrabando":
          return '#FFDD00'; // Dourado mais vibrante
        default:
          return rarityColor;
      }
    };
    
    const enhancedColor = getEnhancedColor();
    
    return {
      background: `linear-gradient(135deg, ${hexToRgba(enhancedColor, 0.35)} 0%, transparent 100%)`,
      borderLeft: `3px solid ${hexToRgba(enhancedColor, 0.85)}`,
      boxShadow: `0 3px 12px ${hexToRgba(enhancedColor, 0.3)}`,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    };
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  // Formatação do float para o estilo X.XXX
  const formatFloat = (value?: number) => {
    if (value === undefined) return '';
    return value.toFixed(4);
  };

  const handleItemClick = () => {
    if (onClick) onClick();
    else if (onEdit) onEdit(item);
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg w-full transition-all duration-300 hover:brightness-110 hover:scale-[1.01] cursor-pointer",
        className
      )}
      style={getBackgroundGradient()}
      onClick={handleItemClick}
    >
      {/* Conteúdo do item */}
      <div className="relative flex items-center p-3 gap-3">
        {/* Imagem com halo luminoso */}
        <div className="h-16 w-16 bg-black/30 rounded flex items-center justify-center shrink-0 overflow-hidden backdrop-blur-sm relative">
          {item.image ? (
            <>
              {/* Efeito de halo baseado na raridade */}
              <div 
                className="absolute inset-0 z-0 opacity-40" 
                style={{
                  background: `radial-gradient(circle at center, ${getRarityColor(item.rarity || '')} 0%, transparent 70%)`,
                  filter: 'blur(5px)'
                }}
              />
              <img
                src={item.image}
                alt={`${item.weapon} | ${item.name}`}
                className="max-h-full max-w-full object-contain relative z-10"
                onError={handleImageError}
                loading="lazy"
                style={{
                  filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
                }}
              />
            </>
          ) : (
            <span className="text-xs text-white/50">No image</span>
          )}
        </div>

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-white truncate">{item.name}</h2>
            {item.isStatTrak && (
              <span className="bg-[#CF6A32]/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                StatTrak™
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-white/90">{item.weapon}</span>
            <span className="text-white/90">{item.wear || "Factory New"}</span>
            {/* Float value exibido com formatação específica */}
            {item.floatValue !== undefined && (
              <span className="text-white/90 text-xs bg-black/30 px-1.5 py-0.5 rounded-full">
                {formatFloat(item.floatValue)}
              </span>
            )}
            {item.tradeLockDays && item.tradeLockDays > 0 && (
              <div className="flex items-center gap-1 text-yellow-300">
                <Lock className="h-3 w-3" />
                <span className="text-xs">{item.tradeLockDays}d</span>
              </div>
            )}
          </div>
        </div>

        {/* Preço e ações */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {item.currentPrice ? formatPrice(item.currentPrice) : (
                item.price ? formatPrice(item.price) : ""
              )}
            </div>
            {showMetadata && item.purchasePrice && (
              <div className="text-xs text-white/80">
                Comprou: {formatPrice(item.purchasePrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.inventoryId);
                }}
              >
                <Heart 
                  className={`h-4 w-4 ${isFavorite ? "fill-white text-white" : ""}`} 
                />
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onDuplicate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(item);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.inventoryId);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
