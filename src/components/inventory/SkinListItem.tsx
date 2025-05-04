
import React from "react";
import { InventoryItem } from "@/types/skin";
import { Edit, Heart, Lock, Trash2, DollarSign, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

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
}: SkinListItemProps) => {
  const { formatPrice } = useCurrency();

  // Função para gerar o gradiente de cor baseado na raridade
  const getBackgroundGradient = () => {
    const rarityGradients: Record<string, string> = {
      'Consumer Grade': 'from-[#8E9196]/80 to-[#6a6d71]/80',
      'Industrial Grade': 'from-[#5E7D9A]/80 to-[#455d72]/80',
      'Mil-Spec Grade': 'from-[#4A6D7C]/80 to-[#37515c]/80',
      'Restricted': 'from-[#6E5AB0]/80 to-[#524283]/80',
      'Classified': 'from-[#8A4E9E]/80 to-[#673976]/80',
      'Covert': 'from-[#9A4A4A]/80 to-[#733737]/80',
      'Contraband': 'from-[#B8A246]/80 to-[#8a7934]/80',
      '★ Rare Special Item': 'from-[#A69D7E]/80 to-[#7d765e]/80',
      'Comum': 'from-[#8E9196]/80 to-[#6a6d71]/80',
      'Pouco Comum': 'from-[#5E7D9A]/80 to-[#455d72]/80',
      'Militar': 'from-[#4A6D7C]/80 to-[#37515c]/80',
      'Restrita': 'from-[#6E5AB0]/80 to-[#524283]/80',
      'Classificada': 'from-[#8A4E9E]/80 to-[#673976]/80',
      'Secreta': 'from-[#9A4A4A]/80 to-[#733737]/80',
      'Contrabando': 'from-[#B8A246]/80 to-[#8a7934]/80',
      'Especial Rara': 'from-[#A69D7E]/80 to-[#7d765e]/80',
    };

    return rarityGradients[item.rarity || ''] || 'from-[#8E9196]/80 to-[#6a6d71]/80';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg w-full transition-all duration-300 hover:brightness-110",
        className
      )}
    >
      {/* Gradiente de fundo baseado na raridade */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          getBackgroundGradient()
        )}
      />
      
      {/* Conteúdo do item */}
      <div className="relative flex items-center p-3 gap-3">
        {/* Imagem */}
        <div className="h-16 w-16 bg-black/20 rounded flex items-center justify-center shrink-0 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={`${item.weapon} | ${item.name}`}
              className="max-h-full max-w-full object-contain"
              onError={handleImageError}
              loading="lazy"
              style={{
                filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
              }}
            />
          ) : (
            <span className="text-xs text-white/50">No image</span>
          )}
        </div>

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-white truncate">{item.name}</h2>
            {item.isStatTrak && (
              <span className="bg-[#CF6A32]/50 text-white text-[10px] px-1 py-0.5 rounded">
                StatTrak™
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-white/80">{item.weapon}</span>
            <span className="text-white/80">{item.wear || "Factory New"}</span>
            {item.floatValue !== undefined && (
              <span className="text-white/70 text-xs">{item.floatValue.toFixed(2)}</span>
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
              <div className="text-xs text-white/70">
                Bought: {formatPrice(item.purchasePrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
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
                className="h-8 w-8 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
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
                className="h-8 w-8 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
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
                className="h-8 w-8 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
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
