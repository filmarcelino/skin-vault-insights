
import React, { useState } from "react";
import { InventoryItem } from "@/types/skin";
import { Edit, Heart, Lock, Info, DollarSign, Copy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getRarityColor, getTradeLockStatus } from "@/utils/skin-utils";

interface SkinCardProps {
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

export const SkinCard = ({
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
}: SkinCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { formatPrice } = useCurrency();
  const { isLocked, daysLeft, tradeLockDate } = getTradeLockStatus(item.tradeLockUntil);

  // Obter a cor com base na raridade
  const getBorderColor = (rarity?: string) => {
    if (!rarity) return "";
    
    // Cores baseadas na imagem de referência
    switch (rarity.toLowerCase()) {
      case "consumer grade":
      case "white":
      case "comum":
        return "#B0C3D9"; // Azul escuro - ajustado para cores CS2
      case "industrial grade":
      case "light blue": 
      case "pouco comum":
        return "#5E98D9"; // Azul médio - ajustado para cores CS2
      case "mil-spec grade":
      case "blue":
      case "militar":
        return "#4B69FF"; // Azul - ajustado para cores CS2
      case "restricted":
      case "purple":
      case "restrita":
        return "#8847FF"; // Roxo - ajustado para cores CS2
      case "classified":
      case "pink":
      case "classificada":
        return "#D32CE6"; // Rosa - ajustado para cores CS2
      case "covert":
      case "red":
      case "secreta":
      case "rara":
        return "#EB4B4B"; // Vermelho - ajustado para cores CS2
      case "contraband":
      case "gold":
      case "contrabando":
        return "#FFD700"; // Dourado
      case "★ rare special item":
      case "special rare":
      case "knife":
      case "glove":
      case "especial rara":
      case "extraordinary":
        return "#FFCA28"; // Amarelo
      default:
        return "#5E7D9A"; // Default
    }
  };

  // Função para gerar o estilo baseado na raridade
  const getBackgroundStyle = () => {
    if (!item.rarity) return {};
    
    const borderColor = getBorderColor(item.rarity);
    
    // Convertemos a cor hex para rgba para poder aplicar transparência
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    // Cores baseadas na imagem de referência para backgrounds
    const getBackgroundColor = () => {
      switch ((item.rarity || '').toLowerCase()) {
        case "consumer grade":
        case "white":
        case "comum":
          return "#1E293B"; // Azul muito escuro
        case "industrial grade":
        case "light blue": 
        case "pouco comum":
          return "#0F2A43"; // Azul escuro
        case "mil-spec grade":
        case "blue":
        case "militar":
          return "#0D1B36"; // Azul escuro
        case "restricted":
        case "purple":
        case "restrita":
          return "#1A0F36"; // Roxo escuro
        case "classified":
        case "pink":
        case "classificada":
          return "#2D1130"; // Rosa escuro
        case "covert":
        case "red":
        case "secreta":
        case "rara":
          return "#2C0D0D"; // Vermelho escuro
        case "contraband":
        case "gold":
        case "contrabando":
        case "★ rare special item":
        case "special rare":
        case "knife":
        case "glove":
        case "especial rara":
        case "extraordinary":
          return "#1C1509"; // Amarelo escuro
        default:
          return "#1A1F2C"; // Cinza escuro como na imagem
      }
    };
    
    return {
      background: getBackgroundColor(),
      border: `1px solid ${hexToRgba(borderColor, 0.7)}`,
      boxShadow: `0 4px 20px ${hexToRgba(borderColor, 0.3)}, inset 0 0 30px ${hexToRgba(borderColor, 0.1)}`,
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

  const handleCardClick = () => {
    if (onClick) onClick();
    else if (onEdit) onEdit(item);
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl w-full transition-transform duration-300 hover:scale-[1.02] cursor-pointer",
        className
      )}
      style={getBackgroundStyle()}
      onClick={handleCardClick}
    >
      {/* Conteúdo do card */}
      <div className="relative h-full flex flex-col p-3">
        {/* Cabeçalho do card */}
        <div className="flex justify-between items-start mb-2 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">{item.name}</h2>
            <p className="text-xs text-white/80 truncate">{item.weapon}</p>
          </div>
          
          {/* Status de tradeable */}
          <div className="flex items-center ml-2 shrink-0">
            {isLocked && daysLeft > 0 ? (
              <div className="flex items-center gap-1 text-yellow-300">
                <Lock className="h-3 w-3" />
                <span className="text-xs">{daysLeft}d</span>
              </div>
            ) : (
              <span className="text-white text-xs font-medium">Tradable</span>
            )}
          </div>
        </div>

        {/* Float value no canto superior direito */}
        {item.floatValue !== undefined && (
          <div className="absolute top-10 right-3 bg-black/40 rounded px-2 py-1 z-10">
            <span className="text-xs font-mono text-white">{formatFloat(item.floatValue)}</span>
          </div>
        )}

        {/* Botão de favorito - reposicionado para não sobrepor */}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-6 w-6 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white rounded-full z-20"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.inventoryId);
            }}
          >
            <Heart 
              className={`h-3 w-3 ${isFavorite ? "fill-white text-white" : ""}`} 
            />
          </Button>
        )}

        {/* Área central com imagem */}
        <div className="flex-1 flex items-center justify-center py-1 mt-2">
          {item.image ? (
            <div className="relative w-full h-full max-h-24 flex items-center justify-center">
              <img
                src={item.image}
                alt={`${item.weapon} | ${item.name}`}
                className="max-h-full max-w-full object-contain"
                onError={handleImageError}
                loading="lazy"
                style={{
                  filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.5))",
                }}
              />
              
              {/* Brilho atrás da imagem */}
              <div 
                className="absolute inset-0 -z-10 opacity-30"
                style={{
                  background: item.rarity ? 
                    `radial-gradient(circle at center, ${getBorderColor(item.rarity)} 0%, transparent 70%)` : 
                    'none'
                }}
              ></div>
            </div>
          ) : (
            <div className="h-20 w-20 bg-black/20 rounded-md flex items-center justify-center">
              <span className="text-white/50">No image</span>
            </div>
          )}
        </div>

        {/* Rodapé com informações */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center">
              <span className="text-white text-xs">{item.wear || "Factory New"}</span>
            </div>
            {item.rarity && (
              <span 
                className="px-2 py-0.5 rounded-full text-white text-[10px]"
                style={{
                  backgroundColor: `${getBorderColor(item.rarity)}40`
                }}
              >
                {item.rarity}
              </span>
            )}
          </div>
          
          {/* Preço completo */}
          <div className="mt-1 text-base font-bold text-white">
            {item.currentPrice !== undefined ? formatPrice(item.currentPrice) : 
             (item.price !== undefined ? formatPrice(item.price) : "")}
          </div>

          {/* Mostrar preço de compra */}
          {item.purchasePrice !== undefined && (
            <div className="mt-0.5 text-xs text-white/80">
              Comprado: {formatPrice(item.purchasePrice)}
            </div>
          )}

          {/* Área colapsável com informações e botões */}
          <Collapsible 
            open={showDetails} 
            onOpenChange={setShowDetails}
            className="mt-2"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center text-white/90 hover:text-white py-1 px-2 -mx-3 text-xs rounded-none"
                style={{
                  backgroundColor: `${getBorderColor(item.rarity)}30`,
                  borderTop: `1px solid ${getBorderColor(item.rarity)}40`
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Detalhes</span>
                </div>
                <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent 
              className="py-2 px-2"
              style={{
                backgroundColor: `${getBorderColor(item.rarity)}20`,
                backdropFilter: 'blur(4px)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-3 gap-1 mt-1">
                {onSell && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10 text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSell(item.inventoryId, {});
                    }}
                  >
                    VENDER
                  </Button>
                )}
                {onDuplicate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10 text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(item);
                    }}
                  >
                    COPIAR
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10 text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    EDITAR
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10 col-span-3 mt-1 text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.inventoryId);
                    }}
                  >
                    REMOVER
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};
