
import { InventoryItem } from "@/types/skin";
import { Badge } from "@/components/ui/badge";
import { Lock, Info, Tag, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { getRarityColor, getRarityColorClass, getTradeLockStatus, formatDate } from "@/utils/skin-utils";

interface SkinDetailsCardProps {
  item: InventoryItem;
}

export const SkinDetailsCard = ({ item }: SkinDetailsCardProps) => {
  const { isLocked, daysLeft, tradeLockDate } = getTradeLockStatus(item.tradeLockUntil);
  const acquiredDate = formatDate(item.acquiredDate);
  
  return (
    <div 
      className={`flex flex-col md:flex-row gap-6 p-5 rounded-xl border-2 mb-2 transition-all shadow-sm ${getRarityColorClass(item.rarity)}`}
      style={{ backgroundColor: `${getRarityColor(item.rarity)}20` }}
    >
      <div className="w-full md:w-1/3 flex items-center justify-center">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="max-h-[26.4rem] max-w-full object-contain scale-[0.55] transform-origin-center"
            style={{ transform: 'scale(0.55)' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="h-40 w-full flex items-center justify-center bg-muted/20 rounded-lg">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
      </div>
      
      <div className="w-full md:w-2/3 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-semibold">
            {item.isStatTrak && (
              <span className="text-[#CF6A32] font-bold">StatTrak™ </span>
            )}
            {item.weapon ? `${item.weapon} | ${item.name}` : item.name}
          </h3>
        </div>
        
        <div className="text-sm text-[#8A898C] mb-4 space-y-3">
          {/* Trade Lock Status */}
          {isLocked ? (
            <div className="flex items-center text-yellow-500 bg-yellow-500/10 p-2 rounded-md">
              <Lock className="h-4 w-4 mr-2" />
              <span>
                Trade Locked for {daysLeft} {daysLeft === 1 ? 'day' : 'days'} 
                (until {tradeLockDate?.toLocaleDateString()})
              </span>
            </div>
          ) : (
            <div className="flex items-center text-green-500 bg-green-500/10 p-2 rounded-md">
              <Info className="h-4 w-4 mr-2" />
              <span>No Trade Lock - Available for trading</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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
                <span className="font-medium">Purchase:</span> ${item.purchasePrice.toFixed(2)}
              </div>
            )}
            
            {/* Current Value */}
            {item.currentPrice !== undefined && item.purchasePrice !== undefined && (
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-2" />
                <span className="font-medium">Current:</span> ${item.currentPrice.toFixed(2)}
                {item.currentPrice > item.purchasePrice && (
                  <span className="ml-1 text-green-500 text-xs">
                    (+${(item.currentPrice - item.purchasePrice).toFixed(2)})
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
