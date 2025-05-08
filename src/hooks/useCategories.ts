
import { useCategories as useOriginalCategories } from "@/hooks/use-skins";

// Define interface for category objects
interface Category {
  type: string;
  name: string;
}

export const useFilteredCategories = () => {
  const { data: categories } = useOriginalCategories();
  
  // Extract weapon types with proper type checks
  const weaponTypes = Array.isArray(categories) 
    ? categories
      .filter((item): item is Category => {
        // Type guard check for item structure
        if (item === null || item === undefined) return false;
        
        if (typeof item !== 'object') return false;
        
        if (!('type' in item) || !('name' in item)) return false;
        
        if (typeof item.type !== 'string' || typeof item.name !== 'string') return false;
        
        return item.type === 'weapon';
      })
      .map((category) => category.name) 
    : [];
  
  // Extract rarity types with proper type checks
  const rarityTypes = Array.isArray(categories) 
    ? categories
      .filter((item): item is Category => {
        // Type guard check for item structure
        if (item === null || item === undefined) return false;
        
        if (typeof item !== 'object') return false;
        
        if (!('type' in item) || !('name' in item)) return false;
        
        if (typeof item.type !== 'string' || typeof item.name !== 'string') return false;
        
        return item.type === 'rarity';
      })
      .map((category) => category.name) 
    : [];

  return {
    weaponTypes,
    rarityTypes
  };
};
