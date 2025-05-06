
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Lock, Trash2 } from "lucide-react";
import { getRarityColor } from "@/utils/skin-utils";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  floatValue?: number;
  onClick?: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  purchasePrice?: number | string;
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
  floatValue,
  onClick,
  onDelete,
  showDeleteButton = false,
  purchasePrice,
}) => {
  const { formatPrice } = useCurrency();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  // Format float to X.XXXX format
  const formatFloat = (value?: number) => {
    if (value === undefined) return '';
    return value.toFixed(4);
  };

  // Get the border color based on rarity
  const getBorderColor = (rarity?: string) => {
    if (!rarity) return "#5E7D9A"; // Default azul escuro
    
    // Cores baseadas na imagem de referência
    switch (rarity.toLowerCase()) {
      case "consumer grade":
      case "white":
      case "comum":
        return "#5E7D9A"; // Azul escuro
      case "industrial grade":
      case "light blue": 
      case "pouco comum":
        return "#0A4D8F"; // Azul médio
      case "mil-spec grade":
      case "blue":
      case "militar":
        return "#0B83C2"; // Azul 
      case "restricted":
      case "purple":
      case "restrita":
        return "#684498"; // Roxo
      case "classified":
      case "pink":
      case "classificada":
        return "#CD3F96"; // Rosa
      case "covert":
      case "red":
      case "secreta":
      case "rara":
        return "#EB4B4B"; // Vermelho
      case "contraband":
      case "gold":
      case "contrabando":
        return "#FFD700"; // Dourado
      case "★ rare special item":
      case "special rare":
      case "knife":
      case "glove":
      case "especial rara":
        return "#FFCA28"; // Amarelo
      default:
        return "#5E7D9A"; // Default
    }
  };

  // Get enhanced gradient background style based on rarity
  const getBackgroundStyle = () => {
    if (!rarity) return {};
    
    const borderColor = getBorderColor(rarity);
    
    // Convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    // Cores baseadas na imagem de referência para backgrounds
    const getBackgroundColor = () => {
      switch (rarity.toLowerCase()) {
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
          return "#1C1509"; // Amarelo escuro
        default:
          return "#1A1F2C"; // Cinza escuro como na imagem
      }
    };

    return {
      background: getBackgroundColor(),
      border: `1px solid ${hexToRgba(borderColor, 0.7)}`,
      boxShadow: `0 4px 12px ${hexToRgba(borderColor, 0.3)}`,
      borderRadius: '12px',
      overflow: 'hidden',
      ...style
    };
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${className} cursor-pointer`}
      onClick={onClick}
      style={getBackgroundStyle()}
    >
      {/* Border glow effect based on rarity */}
      {rarity && (
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${getBorderColor(rarity)}40 0%, transparent 100%)`,
            boxShadow: `inset 0 0 15px ${getBorderColor(rarity)}40`
          }}
        ></div>
      )}
      
      <div className="p-3 flex flex-col h-full relative z-10">
        {/* Moved trade lock to top left corner */}
        {tradeLockDays && tradeLockDays > 0 && (
          <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1 flex items-center">
            <Lock className="h-3 w-3 text-yellow-500" />
            <span className="text-[9px] text-yellow-500 ml-1">
              {tradeLockDays}d
            </span>
          </div>
        )}

        {/* Float value in top right corner */}
        {floatValue !== undefined && (
          <div className="absolute top-2 right-2 bg-black/40 px-1.5 py-0.5 rounded text-xs text-white font-mono">
            {formatFloat(floatValue)}
          </div>
        )}

        {/* Center the image */}
        <div className="relative flex-1 flex items-center justify-center mb-3 py-2 mt-4">
          {image ? (
            <div className="w-full h-28 flex items-center justify-center overflow-hidden">
              <img 
                src={image} 
                alt={`${weaponName} ${skinName}`}
                className="max-h-full max-w-full object-contain"
                onError={handleImageError}
                loading="lazy"
                style={{
                  filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          ) : (
            <div className="text-[10px] text-white/70">No image</div>
          )}
          
          {isStatTrak && (
            <div className="absolute top-1 right-1 bg-[#CF6A32]/80 text-white text-[10px] px-1 py-0.5 rounded">
              StatTrak™
            </div>
          )}
        </div>

        {/* Weapon Name and Info at the bottom */}
        <div className="mt-auto px-1">
          <p className="text-sm text-white/80 truncate mb-0.5">
            {weaponName}
          </p>
          <h3 className="font-bold text-base text-white truncate mb-0.5">
            {skinName}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/90">
              {wear || rarity}
            </span>
            
            {price !== undefined && (
              <span className="text-xs font-semibold text-white">
                {typeof price === 'number' ? formatPrice(price) : price}
              </span>
            )}
          </div>

          {purchasePrice !== undefined && (
            <div className="mt-1 text-xs text-white/90">
              Compra: {typeof purchasePrice === 'number' ? formatPrice(purchasePrice) : purchasePrice}
            </div>
          )}
        </div>
      </div>

      {showDeleteButton && onDelete && (
        <div 
          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1 px-2.5 rounded-md flex items-center"
            onClick={() => onDelete()}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
};
