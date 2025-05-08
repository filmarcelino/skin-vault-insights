
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

// Extract unique weapon types and rarities from the inventory items
export const useFilteredCategories = () => {
  const { categories, collections, isLoading } = useCategories();
  
  // Extract unique weapon types from inventory items
  const weaponTypes = Array.from(
    new Set(categories.map(category => category.name))
  ).sort();
  
  // Extract unique rarity types from inventory items
  const rarityTypes = Array.from(
    new Set(collections.map(collection => collection.name))
  ).sort();
  
  return {
    weaponTypes,
    rarityTypes,
    isLoading,
  };
};

export const useCategories = () => {
  // Type guard for Category
  const isCategory = (item: any): item is Category => {
    return (
      item !== null &&
      typeof item === 'object' &&
      'id' in item &&
      'name' in item &&
      typeof item.id === 'string' &&
      typeof item.name === 'string'
    );
  };

  // Type guard for Collection
  const isCollection = (item: any): item is Collection => {
    return (
      item !== null &&
      typeof item === 'object' &&
      'id' in item &&
      'name' in item &&
      typeof item.id === 'string' &&
      typeof item.name === 'string'
    );
  };

  // Instead of querying non-existent tables, extract categories from inventory data
  const { data: inventoryItems, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory-for-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('weapon, rarity')
        .order('weapon');

      if (error) throw new Error(error.message);
      
      return data || [];
    },
  });

  // Create categories from unique weapon types
  const categories: Category[] = inventoryItems 
    ? Array.from(new Set(inventoryItems
        .filter(item => item.weapon)
        .map(item => item.weapon)))
        .map(weapon => ({ id: weapon, name: weapon }))
    : [];

  // Create collections from unique rarity types
  const collections: Collection[] = inventoryItems
    ? Array.from(new Set(inventoryItems
        .filter(item => item.rarity)
        .map(item => item.rarity)))
        .map(rarity => ({ id: rarity, name: rarity }))
    : [];

  return {
    categories,
    collections,
    isLoading: inventoryLoading,
  };
};
