
import { InventoryItem, Skin } from "@/types/skin";
import { Badge } from "@/components/ui/badge";
import { Lock, Info, Tag, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { getRarityColor, getRarityColorClass, getTradeLockStatus, formatDate } from "@/utils/skin-utils";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";

interface SkinDetailsCardProps {
  skin?: InventoryItem | Skin | null;
  item?: InventoryItem | Skin | null;
  mode?: 'add' | 'view' | 'edit'; 
  onAddToInventory?: (skin: Skin) => Promise<InventoryItem | null>;
}

export const SkinDetailsCard = ({ skin, item, mode, onAddToInventory }: SkinDetailsCardProps) => {
  // Use item if it exists, otherwise use skin, ensure it's never null
  const skinData = item || skin || {};
  
  // Safely access properties with type guards
  const tradeLockUntil = 'tradeLockUntil' in skinData ? skinData.tradeLockUntil : '';
  const acquiredDate = 'acquiredDate' in skinData ? skinData.acquiredDate : '';
  
  // Only call getTradeLockStatus if tradeLockUntil is a string
  const { isLocked, daysLeft, tradeLockDate } = getTradeLockStatus(
    typeof tradeLockUntil === 'string' ? tradeLockUntil : ''
  );
  
  // Only call formatDate if acquiredDate is a string
  const formattedAcquiredDate = formatDate(
    typeof acquiredDate === 'string' ? acquiredDate : ''
  );
  
  const { formatPrice, formatWithCurrency } = useCurrency();
  
  const originalCurrency = 'currency' in skinData ? skinData.currency : "USD";
  const purchaseCurrency = CURRENCIES.find(c => c.code === originalCurrency) || CURRENCIES[0];
  
  const getBackgroundStyle = () => {
    // Safely check if rarity property exists
    const skinRarity = 'rarity' in skinData ? skinData.rarity : '';
    if (!skinRarity) return {};
    
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

    const skinRarityStr = typeof skinRarity === 'string' ? skinRarity : '';
    const colorSet = metallicColors[skinRarityStr] || { 
      main: getRarityColor(skinRarityStr), 
      dark: getRarityColor(skinRarityStr),
      accent: getRarityColor(skinRarityStr)
    };
    
    return {
      background: `linear-gradient(135deg, ${colorSet.dark} 0%, ${colorSet.main} 50%, ${colorSet.accent} 100%)`,
      boxShadow: `0 10px 25px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.07)`,
      border: 'none',
    };
  };
  
  // Safely get image with fallback
  const skinImage = 'image' in skinData ? skinData.image : undefined;
  const skinName = 'name' in skinData ? String(skinData.name) : 'Unknown Skin';
  const skinWeapon = 'weapon' in skinData ? skinData.weapon : undefined;
  
  // Check if the skin has StatTrak
  const isStatTrak = 'isStatTrak' in skinData ? skinData.isStatTrak === true : false;
  
  return (
    <div 
      className="flex flex-col md:flex-row gap-6 p-5 rounded-xl mb-2 transition-all"
      style={getBackgroundStyle()}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 opacity-80 pointer-events-none rounded-xl"></div>
      
      <div className="w-full md:w-1/3 flex items-center justify-center relative z-10">
        {skinImage ? (
          <div className="relative p-4">
            <div className="absolute inset-0 bg-black/20 rounded-lg transform -rotate-3 blur-md"></div>
            <img 
              src={skinImage} 
              alt={typeof skinName === 'string' ? skinName : 'Skin'}
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
            {isStatTrak && (
              <span className="text-[#CF6A32] font-bold">StatTrak™ </span>
            )}
            {skinWeapon ? 
              `${typeof skinWeapon === 'string' ? skinWeapon : ''} | ${typeof skinName === 'string' ? skinName : ''}` : 
              typeof skinName === 'string' ? skinName : 'Unknown Skin'
            }
          </h3>
        </div>
        
        <div className="text-sm text-white/80 mb-4 space-y-3">
          {isLocked ? (
            <div className="flex items-center text-yellow-400 bg-black/30 p-2 rounded-md border border-yellow-400/30">
              <Lock className="h-4 w-4 mr-2" />
              <span>
                Trade Locked for {daysLeft} {daysLeft === 1 ? 'day' : 'days'} 
                {tradeLockDate && ` (until ${tradeLockDate.toLocaleDateString()})`}
              </span>
            </div>
          ) : (
            <div className="flex items-center text-green-400 bg-black/30 p-2 rounded-md border border-green-400/30">
              <Info className="h-4 w-4 mr-2" />
              <span>No Trade Lock - Available for trading</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-white/90">
            {skinData && 'rarity' in skinData && skinData.rarity && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <div className="min-w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getRarityColor(typeof skinData.rarity === 'string' ? skinData.rarity : '') }}></div>
                <span className="font-medium mr-1">Rarity:</span> <span className="break-words">
                  {typeof skinData.rarity === 'string' ? skinData.rarity : ''}
                </span>
              </div>
            )}
            
            {skinData && 'wear' in skinData && skinData.wear && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <Tag className="min-w-3 h-3 mr-2 shrink-0" />
                <span className="font-medium mr-1">Wear:</span> <span className="break-words">
                  {typeof skinData.wear === 'string' ? skinData.wear : ''}
                </span>
              </div>
            )}
            
            {skinData && 'floatValue' in skinData && skinData.floatValue !== undefined && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <span className="font-medium mr-1">Float:</span> <span className="break-words">
                  {typeof skinData.floatValue === 'number' ? skinData.floatValue.toFixed(8) : '0.00000000'}
                </span>
              </div>
            )}
            
            <div className="flex items-center bg-black/20 p-2 rounded-md">
              <Calendar className="min-w-3 h-3 mr-2 shrink-0" />
              <span className="font-medium mr-1">Acquired:</span> <span className="break-words">{formattedAcquiredDate}</span>
            </div>
            
            {skinData && 'purchasePrice' in skinData && skinData.purchasePrice !== undefined && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <DollarSign className="min-w-3 h-3 mr-2 shrink-0" />
                <span className="font-medium mr-1">Purchase:</span> <span className="break-words">
                  {purchaseCurrency.symbol}
                  {typeof skinData.purchasePrice === 'number' ? skinData.purchasePrice.toFixed(2) : '0.00'} 
                  {purchaseCurrency.code}
                </span>
              </div>
            )}
            
            {skinData && 'currentPrice' in skinData && skinData.currentPrice !== undefined && 
             skinData && 'purchasePrice' in skinData && skinData.purchasePrice !== undefined && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <TrendingUp className="min-w-3 h-3 mr-2 shrink-0" />
                <span className="font-medium mr-1">Current:</span> <span className="break-words">
                  {typeof skinData.currentPrice === 'number' ? formatPrice(skinData.currentPrice) : '0.00'}
                  {typeof skinData.currentPrice === 'number' && typeof skinData.purchasePrice === 'number' && 
                   skinData.currentPrice > skinData.purchasePrice && (
                    <span className="ml-1 text-green-400 text-xs">
                      (+{formatPrice(skinData.currentPrice - skinData.purchasePrice)})
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {skinData && 'marketplace' in skinData && skinData.marketplace && (
              <div className="flex items-center bg-black/20 p-2 rounded-md">
                <span className="font-medium mr-1">Source:</span> <span className="break-words">
                  {typeof skinData.marketplace === 'string' ? skinData.marketplace : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
