
import { SkinWear } from "@/types/skin";
import { format, parseISO, isAfter } from "date-fns";

// Get color for a specific rarity
export const getRarityColor = (rarity?: string): string => {
  if (!rarity) return "#888888";
  
  switch (rarity.toLowerCase()) {
    case "consumer grade":
    case "white":
      return "#B0C3D9";
    case "industrial grade":
    case "light blue":
      return "#5E98D9";
    case "mil-spec grade":
    case "blue":
      return "#4B69FF";
    case "restricted":
    case "purple":
      return "#8847FF";
    case "classified":
    case "pink":
      return "#D32CE6";
    case "covert":
    case "red":
      return "#EB4B4B";
    case "contraband":
    case "gold":
      return "#FFD700";
    case "extraordinary":
    case "rare special":
    case "knife":
    case "glove":
      return "#FFF99B";
    default:
      return "#888888";
  }
};

// Get trade lock status of an item
export const getTradeLockStatus = (tradeLockUntil?: string) => {
  if (!tradeLockUntil) return { isLocked: false, daysLeft: 0 };
  
  const now = new Date();
  const lockEnd = tradeLockUntil ? parseISO(tradeLockUntil) : now;
  const isLocked = isAfter(lockEnd, now);
  
  // Calculate days left
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = isLocked ? Math.ceil((lockEnd.getTime() - now.getTime()) / msPerDay) : 0;
  
  return { isLocked, daysLeft };
};

// Get current date as ISO string
export const getCurrentDateAsString = (): string => {
  return new Date().toISOString();
};

// Format a date for display
export const formatDate = (date?: string): string => {
  if (!date) return "";
  try {
    return format(parseISO(date), "dd/MM/yyyy");
  } catch (error) {
    return "";
  }
};
