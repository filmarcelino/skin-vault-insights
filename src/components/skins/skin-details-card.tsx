
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
  
  // Get enhanced gradient background style based on rarity
  const getBackgroundStyle = () => {
    if (!item.rarity) return {};
    
    const metallicColors: Record<string, { main: string, dark: string, accent: string }> = {
      'Consumer Grade': { 
        main: '#8E9196', 
        dark: '#6a6d71',
        accent: '#9fa6ad'
      },
      'Industrial Grade': { 
        main: '#5E7D9A', 
        dark: '#455d72',
        accent: '#6b8eb0'
      },
      'Mil-Spec Grade': { 
        main: '#4A6D7C', 
        dark: '#37515c',
        accent: '#5c8595'
      },
      'Restricted': { 
        main: '#6E5AB0', 
        dark: '#524283',
        accent: '#8370c6'
      },
      'Classified': { 
        main: '#8A4E9E', 
        dark: '#673976',
        accent: '#a062b8'
      },
      'Covert': { 
        main: '#9A4A4A', 
        dark: '#733737',
        accent: '#b15858'
      },
      'Contraband': { 
        main: '#B8A246', 
        dark: '#8a7934',
        accent: '#ccb65a'
      },
      '★ Rare Special Item': { 
        main: '#A69D7E', 
        dark: '#7d765e',
        accent: '#b9af90'
      },
      'Comum': { 
        main: '#8E9196',
        dark: '#6a6d71',
        accent: '#9fa6ad'
      },
      'Pouco Comum': { 
        main: '#5E7D9A',
        dark: '#455d72',
        accent: '#6b8eb0'
      },
      'Militar': { 
        main: '#4A6D7C',
        dark: '#37515c',
        accent: '#5c8595' 
      },
      'Restrita': { 
        main: '#6E5AB0',
        dark: '#524283',
        accent: '#8370c6'
      },
      'Classificada': { 
        main: '#8A4E9E',
        dark: '#673976',
        accent: '#a062b8'
      },
      'Secreta': { 
        main: '#9A4A4A',
        dark: '#733737',
        accent: '#b15858'
      },
      'Contrabando': { 
        main: '#B8A246',
        dark: '#8a7934',
        accent: '#ccb65a'
      },
      'Especial Rara': { 
        main: '#A69D7E',
        dark: '#7d765e',
        accent: '#b9af90'
      },
      'Extraordinary': { 
        main: '#A69D7E',
        dark: '#7d765e',
        accent: '#b9af90'
      },
    };

    const colorSet = metallicColors[item.rarity] || { 
      main: getRarityColor(item.rarity), 
      dark: getRarityColor(item.rarity),
      accent: getRarityColor(item.rarity)
    };
    
    return {
      background: `linear-gradient(135deg, ${colorSet.dark} 0%, ${colorSet.main} 50%, ${colorSet.accent} 100%)`,
      boxShadow: `0 10px 25px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.07)`,
      border: 'none',
    };
  };
  
  return (
    <div 
      className="flex flex-col md:flex-row gap-6 p-5 rounded-xl mb-2 transition-all"
      style={getBackgroundStyle()}
    >
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 opacity-80 pointer-events-none rounded-xl"></div>
      
      <div className="w-full md:w-1/3 flex items-center justify-center relative z-10">
        {item.image ? (
          <div className="relative p-4">
            <div className="absolute inset-0 bg-black/20 rounded-lg transform -rotate-3 blur-md"></div>
            <img 
              src={item.image} 
              alt={item.name} 
              className="max-h-[20rem] max-w-full object-contain transform transition-all hover:scale-105 relative z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
              style={{
                filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.5))"
              }}
            />
          </div>
        ) : (
          <div className="h-40 w-full flex items-center justify-center bg-black/20 rounded-lg">
            <span className="text-white/70">No image available</span>
          </div>
        )}
      </div>
      
      <div className="w-full md:w-2/3 flex flex-col justify-center relative z-10">
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
            <div className="flex items-center text-yellow-400 bg-black/30 p-2 rounded-md border border-yellow-400/30">
              <Lock className="h-4 w-4 mr-2" />
              <span>
                Trade Locked for {daysLeft} {daysLeft === 1 ? 'day' : 'days'} 
                (until {tradeLockDate?.toLocaleDateString()})
              </span>
            </div>
          ) : (
            <div className="flex items-center text-green-400 bg-black/30 p-2 rounded-md border border-green-400/30">
              <Info className="h-4 w-4 mr-2" />
              <span>No Trade Lock - Available for trading</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-white/90">
            {/* Rarity */}
            {item.rarity && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <div className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getRarityColor(item.rarity) }}></div>
                <span className="font-medium">Rarity:</span> {item.rarity}
              </div>
            )}
            
            {/* Wear */}
            {item.wear && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <Tag className="h-3 w-3 mr-2" />
                <span className="font-medium">Wear:</span> {item.wear}
              </div>
            )}
            
            {/* Float */}
            {item.floatValue !== undefined && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <span className="font-medium">Float:</span> {item.floatValue.toFixed(8)}
              </div>
            )}
            
            {/* Acquisition Date */}
            <div className="flex items-center bg-black/20 p-2 rounded-md">
              <Calendar className="h-3 w-3 mr-2" />
              <span className="font-medium">Acquired:</span> {acquiredDate}
            </div>
            
            {/* Purchase Price */}
            {item.purchasePrice !== undefined && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <DollarSign className="h-3 w-3 mr-2" />
                <span className="font-medium">Purchase:</span> {formatPrice(item.purchasePrice)}
              </div>
            )}
            
            {/* Current Value */}
            {item.currentPrice !== undefined && item.purchasePrice !== undefined && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
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
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <span className="font-medium">Source:</span> {item.marketplace}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
