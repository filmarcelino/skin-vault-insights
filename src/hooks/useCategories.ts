
import { useCategories as useOriginalCategories } from "@/hooks/use-skins";

// Definindo interface para garantir tipo correto
interface Category {
  type: string;
  name: string;
}

export const useFilteredCategories = () => {
  const { data: categories } = useOriginalCategories();
  
  // Extract weapon types with proper type checks
  const weaponTypes = categories
    ?.filter((category): category is Category => {
      // Verificação para garantir que category é um objeto válido com as propriedades necessárias
      return category !== null && 
             category !== undefined && 
             typeof category === 'object' &&
             'type' in category &&
             typeof category.type === 'string' &&
             category.type === 'weapon';
    })
    .map((category) => {
      // Com o type guard acima, o TypeScript já sabe que category é do tipo Category
      return category.name;
    }) || [];
  
  // Extract rarity types with proper type checks
  const rarityTypes = categories
    ?.filter((category): category is Category => {
      // Verificação para garantir que category é um objeto válido com as propriedades necessárias
      return category !== null && 
             category !== undefined && 
             typeof category === 'object' &&
             'type' in category &&
             typeof category.type === 'string' &&
             category.type === 'rarity';
    })
    .map((category) => {
      // Com o type guard acima, o TypeScript já sabe que category é do tipo Category
      return category.name;
    }) || [];

  return {
    weaponTypes,
    rarityTypes
  };
};
