
import { useCategories as useOriginalCategories } from "@/hooks/use-skins";

// Define interface for category objects
interface Category {
  type: string;
  name: string;
}

// Define type for any element that might be in the categories array
type CategoryItem = unknown;

export const useFilteredCategories = () => {
  const { data: categories } = useOriginalCategories();
  
  // Extract weapon types with proper type checks
  const weaponTypes = Array.isArray(categories) 
    ? categories
      .filter((item: CategoryItem): item is Category => {
        // Type guard check for item structure
        if (!item) return false;
        
        return (
          typeof item === 'object' && 
          item !== null &&
          'type' in item && 
          'name' in item && 
          typeof (item as any).type === 'string' && 
          typeof (item as any).name === 'string' && 
          (item as any).type === 'weapon'
        );
      })
      .map((category) => category.name) 
    : [];
  
  // Extract rarity types with proper type checks
  const rarityTypes = Array.isArray(categories) 
    ? categories
      .filter((item: CategoryItem): item is Category => {
        // Type guard check for item structure
        if (!item) return false;
        
        return (
          typeof item === 'object' && 
          item !== null &&
          'type' in item && 
          'name' in item && 
          typeof (item as any).type === 'string' && 
          typeof (item as any).name === 'string' && 
          (item as any).type === 'rarity'
        );
      })
      .map((category) => category.name) 
    : [];

  return {
    weaponTypes,
    rarityTypes
  };
};
