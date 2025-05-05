
import { useCategories as useOriginalCategories } from "@/hooks/use-skins";

export const useFilteredCategories = () => {
  const { data: categories } = useOriginalCategories();
  
  // Extract weapon types with proper null checks
  const weaponTypes = categories
    ?.filter((category) => {
      if (!category) return false;
      if (typeof category !== 'object') return false;
      return 'type' in category && category.type === 'weapon';
    })
    .map((category) => {
      if (!category) return '';
      if (typeof category !== 'object') return '';
      if (!('name' in category)) return '';
      if (typeof category.name !== 'string') return '';
      return category.name;
    })
    .filter((name) => name !== '') || [];
  
  // Extract rarity types with proper null checks
  const rarityTypes = categories
    ?.filter((category) => {
      if (!category) return false;
      if (typeof category !== 'object') return false;
      return 'type' in category && category.type === 'rarity';
    })
    .map((category) => {
      if (!category) return '';
      if (typeof category !== 'object') return '';
      if (!('name' in category)) return '';
      if (typeof category.name !== 'string') return '';
      return category.name;
    })
    .filter((name) => name !== '') || [];

  return {
    weaponTypes,
    rarityTypes
  };
};
