
import React, { useState } from "react";
import { InventoryItem } from "@/types/skin";
import { Edit, Heart, Lock, Info, DollarSign, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface SkinCardProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDuplicate?: (item: InventoryItem) => void;
  onRemove?: (itemId: string) => void;
  onSell?: (itemId: string, sellData: any) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (itemId: string) => void;
  className?: string;
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
}: SkinCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { formatPrice } = useCurrency();

  // Função para gerar o gradiente de cor baseado na raridade
  const getBackgroundGradient = () => {
    const rarityGradients: Record<string, string> = {
      'Consumer Grade': 'from-[#8E9196] to-[#6a6d71]',
      'Industrial Grade': 'from-[#5E7D9A] to-[#455d72]',
      'Mil-Spec Grade': 'from-[#4A6D7C] to-[#37515c]',
      'Restricted': 'from-[#6E5AB0] to-[#524283]',
      'Classified': 'from-[#8A4E9E] to-[#673976]',
      'Covert': 'from-[#9A4A4A] to-[#733737]',
      'Contraband': 'from-[#B8A246] to-[#8a7934]',
      '★ Rare Special Item': 'from-[#A69D7E] to-[#7d765e]',
      'Comum': 'from-[#8E9196] to-[#6a6d71]',
      'Pouco Comum': 'from-[#5E7D9A] to-[#455d72]',
      'Militar': 'from-[#4A6D7C] to-[#37515c]',
      'Restrita': 'from-[#6E5AB0] to-[#524283]',
      'Classificada': 'from-[#8A4E9E] to-[#673976]',
      'Secreta': 'from-[#9A4A4A] to-[#733737]',
      'Contrabando': 'from-[#B8A246] to-[#8a7934]',
      'Especial Rara': 'from-[#A69D7E] to-[#7d765e]',
    };

    return rarityGradients[item.rarity || ''] || 'from-[#8E9196] to-[#6a6d71]';
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
    >
      {/* Gradiente de fundo baseado na raridade */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          getBackgroundGradient()
        )}
      />
      
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
              <span className="px-3 py-1 bg-black/40 rounded-full text-white text-xs">
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

          {/* Área de botões de ação */}
          <div className={`
            mt-3 bg-black/40 -mx-4 -mb-4 p-3 pt-2 transition-all duration-300
            ${showDetails ? "max-h-40" : "max-h-14 overflow-hidden"}
          `}>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                {item.purchasePrice && (
                  <div className="text-sm text-white/90 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Bought for {formatPrice(item.purchasePrice)}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full bg-black/20"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Info className="h-3.5 w-3.5 text-white/80" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              {onSell && (
                <Button
                  variant="outline"
                  className="bg-amber-900/50 border-amber-800/50 text-white hover:bg-amber-800/70 hover:text-white"
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
                  className="bg-amber-900/50 border-amber-800/50 text-white hover:bg-amber-800/70 hover:text-white"
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
                  className="bg-amber-900/50 border-amber-800/50 text-white hover:bg-amber-800/70 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                >
                  EDIT
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
