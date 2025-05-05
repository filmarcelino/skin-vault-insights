
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
      // Ensure item exists
      if (item === null || item === undefined) {
        return false;
      }
      
      // Ensure item is an object
      if (typeof item !== 'object') {
        return false;
      }
      
      // Ensure item has the required properties
      if (!('type' in item) || !('name' in item)) {
        return false;
      }
      
      // Get the properties with safe type checking
      const type = (item as { type?: unknown }).type;
      const name = (item as { name?: unknown }).name;
      
      // Ensure item properties are of the right type
      if (typeof type !== 'string' || typeof name !== 'string') {
        return false;
      }
      
      // Ensure item is a weapon type
      return type === 'weapon';
    })
    .map((category) => category.name) || [];
  
  // Extract rarity types with proper type checks
  const rarityTypes = categories
    ?.filter((item): item is Category => {
      // Ensure item exists
      if (item === null || item === undefined) {
        return false;
      }
      
      // Ensure item is an object
      if (typeof item !== 'object') {
        return false;
      }
      
      // Ensure item has the required properties
      if (!('type' in item) || !('name' in item)) {
        return false;
      }
      
      // Get the properties with safe type checking
      const type = (item as { type?: unknown }).type;
      const name = (item as { name?: unknown }).name;
      
      // Ensure item properties are of the right type
      if (typeof type !== 'string' || typeof name !== 'string') {
        return false;
      }
      
      // Ensure item is a rarity type
      return type === 'rarity';
    })
    .map((category) => category.name) || [];

  return {
    weaponTypes,
    rarityTypes
  };
};
