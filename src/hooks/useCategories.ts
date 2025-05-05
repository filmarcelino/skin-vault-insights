
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
      // Type guard to ensure item is a valid Category object
      return item !== null && 
             item !== undefined && 
             typeof item === 'object' &&
             'type' in item &&
             typeof item.type === 'string' &&
             item.type === 'weapon';
    })
    .map((category) => category.name) || [];
  
  // Extract rarity types with proper type checks
  const rarityTypes = categories
    ?.filter((item): item is Category => {
      // Type guard to ensure item is a valid Category object
      return item !== null && 
             item !== undefined && 
             typeof item === 'object' &&
             'type' in item &&
             typeof item.type === 'string' &&
             item.type === 'rarity';
    })
    .map((category) => category.name) || [];

  return {
    weaponTypes,
    rarityTypes
  };
};
