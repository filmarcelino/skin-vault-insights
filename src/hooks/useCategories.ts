
import { useCategories as useOriginalCategories } from "@/hooks/use-skins";

// Define interface for category objects
interface Category {
  type: string;
  name: string;
}

export const useFilteredCategories = () => {
  const { data: categories } = useOriginalCategories();
  
  // Extract weapon types with proper type checks
  const weaponTypes = categories
    ?.filter((item): item is Category => {
      // Se o item for nulo, indefinido ou não for um objeto, retornamos false
      if (!item || typeof item !== 'object') {
        return false;
      }
      
      // Type guard check
      return (
        'type' in item && 
        'name' in item && 
        typeof item.type === 'string' && 
        typeof item.name === 'string' && 
        item.type === 'weapon'
      );
    })
    .map((category) => category.name) || [];
  
  // Extract rarity types with proper type checks
  const rarityTypes = categories
    ?.filter((item): item is Category => {
      // Se o item for nulo, indefinido ou não for um objeto, retornamos false
      if (!item || typeof item !== 'object') {
        return false;
      }
      
      // Type guard check
      return (
        'type' in item && 
        'name' in item && 
        typeof item.type === 'string' && 
        typeof item.name === 'string' && 
        item.type === 'rarity'
      );
    })
    .map((category) => category.name) || [];

  return {
    weaponTypes,
    rarityTypes
  };
};
