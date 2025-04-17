
import { SkinWear } from "@/types/skin";

// Get the color class for rarity styling
export const getRarityColorClass = (rarity?: string) => {
  if (!rarity) return "";
  
  switch (rarity.toLowerCase()) {
    case "consumer grade":
    case "white":
    case "comum":
      return "bg-[rgba(176,195,217,0.2)] border-[#B0C3D9]";
    case "industrial grade":
    case "light blue":
    case "pouco comum":
      return "bg-[rgba(94,152,217,0.2)] border-[#5E98D9]";
    case "mil-spec grade":
    case "blue":
    case "militar":
      return "bg-[rgba(75,105,255,0.2)] border-[#4B69FF]";
    case "restricted":
    case "purple":
    case "restrita":
      return "bg-[rgba(136,71,255,0.2)] border-[#8847FF]";
    case "classified":
    case "pink":
    case "classificada":
      return "bg-[rgba(211,44,230,0.2)] border-[#D32CE6]";
    case "covert":
    case "red":
    case "secreta":
    case "rara":
      return "bg-[rgba(235,75,75,0.2)] border-[#EB4B4B]";
    case "contraband":
    case "gold":
    case "contrabando":
      return "bg-[rgba(255,215,0,0.2)] border-[#FFD700]";
    case "extraordinary":
    case "rare special":
    case "knife":
    case "glove":
    case "especial rara":
      return "bg-[rgba(255,249,155,0.2)] border-[#FFF99B]";
    default:
      return "";
  }
};

// Get the color for rarity styling
export const getRarityColor = (rarity?: string) => {
  if (!rarity) return "#888888";
  
  switch (rarity.toLowerCase()) {
    case "consumer grade":
    case "white":
    case "comum":
      return "#B0C3D9";
    case "industrial grade":
    case "light blue":
    case "pouco comum":
      return "#5E98D9";
    case "mil-spec grade":
    case "blue":
    case "militar":
      return "#4B69FF";
    case "restricted":
    case "purple":
    case "restrita":
      return "#8847FF";
    case "classified":
    case "pink":
    case "classificada":
      return "#D32CE6";
    case "covert":
    case "red":
    case "secreta":
    case "rara":
      return "#EB4B4B";
    case "contraband":
    case "gold":
    case "contrabando":
      return "#FFD700";
    case "extraordinary":
    case "rare special":
    case "knife":
    case "glove":
    case "especial rara":
      return "#FFF99B";
    default:
      return "#888888";
  }
};

// Calculate trade lock status and days left
export const getTradeLockStatus = (tradeLockUntil?: string) => {
  const tradeLockDate = tradeLockUntil ? new Date(tradeLockUntil) : null;
  const isLocked = tradeLockDate && tradeLockDate > new Date();
  const daysLeft = tradeLockDate 
    ? Math.ceil((tradeLockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  
  return { isLocked, daysLeft, tradeLockDate };
};

// Calculate profit from selling a skin
export const calculateProfit = (soldPrice: string, feePercentage: string, purchasePrice: number) => {
  const price = parseFloat(soldPrice);
  const fee = parseFloat(feePercentage) || 0;
  
  const feeAmount = (price * fee) / 100;
  return price - feeAmount - purchasePrice;
};

// Get formatted date from ISO string
export const formatDate = (dateString?: string) => {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString();
};

// List of marketplace options for selling skins
export const MARKETPLACE_OPTIONS = [
  { value: "steam", label: "Steam Market" },
  { value: "buff163", label: "BUFF163" },
  { value: "skinport", label: "Skinport" },
  { value: "dmarket", label: "DMarket" },
  { value: "cs_money", label: "CS.MONEY" },
  { value: "other", label: "Other" },
];
