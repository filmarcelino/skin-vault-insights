
import { InventoryItem } from "@/types/skin";
import { Badge } from "@/components/ui/badge";
import { Lock, Info, Tag, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { getRarityColor, getRarityColorClass, getTradeLockStatus, formatDate } from "@/utils/skin-utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SkinDetailsCardProps {
  item: InventoryItem;
}

export const SkinDetailsCard = ({ item }: SkinDetailsCardProps) => {
  const { isLocked, daysLeft, tradeLockDate } = getTradeLockStatus(item.tradeLockUntil);
  const acquiredDate = formatDate(item.acquiredDate);
  const { formatPrice } = useCurrency();
  
  // Get metallic background style based on rarity
  const getBackgroundStyle = () => {
    if (!item.rarity) return {};
    
    const metallicColors: Record<string, string> = {
      'Consumer Grade': '#8E9196',
      'Industrial Grade': '#5E7D9A',
      'Mil-Spec Grade': '#4A6D7C',
      'Restricted': '#6E5AB0',
      'Classified': '#8A4E9E',
      'Covert': '#9A4A4A',
      'Contraband': '#B8A246',
      '★ Rare Special Item': '#A69D7E',
      'Comum': '#8E9196',
      'Pouco Comum': '#5E7D9A',
      'Militar': '#4A6D7C',
      'Restrita': '#6E5AB0',
      'Classificada': '#8A4E9E',
      'Secreta': '#9A4A4A',
      'Contrabando': '#B8A246',
      'Especial Rara': '#A69D7E',
    };

    const bgColor = metallicColors[item.rarity] || getRarityColor(item.rarity);
    
    return {
      background: `linear-gradient(135deg, ${bgColor} 0%, ${adjustColor(bgColor, -20)} 100%)`,
      boxShadow: `inset 0 0 20px rgba(0,0,0,0.4)`,
      border: 'none',
    };
  };

  // Helper function to darken/lighten a color
  const adjustColor = (color: string, amount: number) => {
    return color;
  };
  
  return (
    <div 
      className="flex flex-col md:flex-row gap-6 p-5 rounded-xl mb-2 transition-all shadow-md"
      style={getBackgroundStyle()}
    >
      <div className="w-full md:w-1/3 flex items-center justify-center">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="max-h-[20rem] max-w-full object-contain transform transition-all hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="h-40 w-full flex items-center justify-center bg-black/20 rounded-lg">
            <span className="text-white/70">No image available</span>
          </div>
        )}
      </div>
      
      <div className="w-full md:w-2/3 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-white">
            {item.isStatTrak && (
              <span className="text-[#CF6A32] font-bold">StatTrak™ </span>
            )}
            {item.weapon ? `${item.weapon} | ${item.name}` : item.name}
          </h3>
        </div>
        
        <div className="text-sm text-white/80 mb-4 space-y-3">
          {/* Trade Lock Status */}
          {isLocked ? (
            <div className="flex items-center text-yellow-400 bg-black/20 p-2 rounded-md">
              <Lock className="h-4 w-4 mr-2" />
              <span>
                Trade Locked for {daysLeft} {daysLeft === 1 ? 'day' : 'days'} 
                (until {tradeLockDate?.toLocaleDateString()})
              </span>
            </div>
          ) : (
            <div className="flex items-center text-green-400 bg-black/20 p-2 rounded-md">
              <Info className="h-4 w-4 mr-2" />
              <span>No Trade Lock - Available for trading</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-white/90">
            {/* Rarity */}
            {item.rarity && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getRarityColor(item.rarity) }}></div>
                <span className="font-medium">Rarity:</span> {item.rarity}
              </div>
            )}
            
            {/* Wear */}
            {item.wear && (
              <div className="flex items-center">
                <Tag className="h-3 w-3 mr-2" />
                <span className="font-medium">Wear:</span> {item.wear}
              </div>
            )}
            
            {/* Float */}
            {item.floatValue !== undefined && (
              <div className="flex items-center">
                <span className="font-medium">Float:</span> {item.floatValue.toFixed(8)}
              </div>
            )}
            
            {/* Acquisition Date */}
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-2" />
              <span className="font-medium">Acquired:</span> {acquiredDate}
            </div>
            
            {/* Purchase Price */}
            {item.purchasePrice !== undefined && (
              <div className="flex items-center">
                <DollarSign className="h-3 w-3 mr-2" />
                <span className="font-medium">Purchase:</span> {formatPrice(item.purchasePrice)}
              </div>
            )}
            
            {/* Current Value */}
            {item.currentPrice !== undefined && item.purchasePrice !== undefined && (
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-2" />
                <span className="font-medium">Current:</span> {formatPrice(item.currentPrice)}
                {item.currentPrice > item.purchasePrice && (
                  <span className="ml-1 text-green-400 text-xs">
                    (+{formatPrice(item.currentPrice - item.purchasePrice)})
                  </span>
                )}
              </div>
            )}
            
            {/* Marketplace */}
            {item.marketplace && (
              <div className="flex items-center">
                <span className="font-medium">Source:</span> {item.marketplace}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
