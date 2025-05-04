
import React, { useState } from "react";
import { InventoryItem } from "@/types/skin";
import { Edit, Heart, Lock, Info, DollarSign, Copy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getRarityColor } from "@/utils/skin-utils";

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

  // Função para gerar o estilo baseado na raridade
  const getBackgroundStyle = () => {
    if (!item.rarity) return {};
    
    const rarityColor = getRarityColor(item.rarity);
    
    // Convertemos a cor hex para rgba para poder aplicar transparência
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    return {
      background: `linear-gradient(135deg, ${hexToRgba(rarityColor, 0.15)} 0%, transparent 100%)`,
      border: `1px solid ${hexToRgba(rarityColor, 0.5)}`,
      boxShadow: `0 4px 20px ${hexToRgba(rarityColor, 0.2)}, inset 0 0 30px ${hexToRgba(rarityColor, 0.05)}`,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    };
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl w-full aspect-square max-w-[340px] transition-transform duration-300 hover:scale-[1.02]",
        className
      )}
      style={getBackgroundStyle()}
      onClick={onClick}
    >
      {/* Borda brilhante baseada na raridade */}
      {item.rarity && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${getRarityColor(item.rarity)}50`,
            borderRadius: 'inherit'
          }}
        ></div>
      )}
      
      {/* Conteúdo do card */}
      <div className="relative h-full flex flex-col p-4">
        {/* Cabeçalho do card */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold text-white">{item.name}</h2>
            <p className="text-sm text-white/80">{item.weapon}</p>
          </div>
          
          {/* Status de tradeable */}
          <div className="flex items-center">
            {!item.tradeLockDays || item.tradeLockDays <= 0 ? (
              <span className="text-white text-sm font-medium">Tradable</span>
            ) : (
              <div className="flex items-center gap-1 text-yellow-300">
                <Lock className="h-3 w-3" />
                <span className="text-xs">{item.tradeLockDays}d</span>
              </div>
            )}
          </div>
        </div>

        {/* Botão de favorito */}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white rounded-full z-10"
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

        {/* Área central com imagem */}
        <div className="flex-1 flex items-center justify-center py-2">
          {item.image ? (
            <div className="relative h-full w-full max-h-36 flex items-center justify-center">
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
                className="absolute inset-0 -z-10 opacity-20"
                style={{
                  background: item.rarity ? 
                    `radial-gradient(circle at center, ${getRarityColor(item.rarity)} 0%, transparent 70%)` : 
                    'none'
                }}
              ></div>
            </div>
          ) : (
            <div className="h-28 w-28 bg-black/20 rounded-md flex items-center justify-center">
              <span className="text-white/50">No image</span>
            </div>
          )}
        </div>

        {/* Rodapé com informações */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <span className="text-white font-medium">{item.wear || "Factory New"}</span>
              {item.floatValue !== undefined && (
                <span className="ml-2 text-white/70 text-sm">{item.floatValue.toFixed(2)}</span>
              )}
            </div>
            {item.rarity && (
              <span 
                className="px-3 py-1 rounded-full text-white text-xs"
                style={{
                  backgroundColor: `${getRarityColor(item.rarity)}40`
                }}
              >
                {item.rarity}
              </span>
            )}
          </div>
          
          {/* Preço de compra */}
          <div className="mt-2 text-xl font-bold text-white">
            {item.currentPrice ? formatPrice(item.currentPrice) : (
              item.price ? formatPrice(item.price) : ""
            )}
          </div>

          {/* Mostrar metadados adicionais quando showMetadata é true */}
          {showMetadata && item.purchasePrice && (
            <div className="mt-1 text-sm text-white/80">
              Comprado: {formatPrice(item.purchasePrice)}
            </div>
          )}

          {/* Área colapsável com informações e botões */}
          <Collapsible 
            open={showDetails} 
            onOpenChange={setShowDetails}
            className="mt-3"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center text-white/90 hover:text-white py-2 px-3 -mx-4 rounded-none"
                style={{
                  backgroundColor: item.rarity ? `${getRarityColor(item.rarity)}20` : 'rgba(0,0,0,0.4)',
                  borderTop: item.rarity ? `1px solid ${getRarityColor(item.rarity)}30` : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Detalhes</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent 
              className="py-3 px-4"
              style={{
                backgroundColor: item.rarity ? `${getRarityColor(item.rarity)}10` : 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(4px)'
              }}
            >
              {item.purchasePrice && (
                <div className="text-sm text-white/90 flex items-center mb-2">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Comprado por {formatPrice(item.purchasePrice)}
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2 mt-3">
                {onSell && (
                  <Button
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSell(item.inventoryId, {});
                    }}
                  >
                    SELL
                  </Button>
                )}
                {onDuplicate && (
                  <Button
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(item);
                    }}
                  >
                    COPY
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    EDIT
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10 col-span-3 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.inventoryId);
                    }}
                  >
                    REMOVE
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
