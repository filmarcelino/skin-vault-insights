
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

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw new Error(error.message);
      
      // Filter out invalid data using type guard
      return (data || []).filter(isCategory);
    },
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('name');

      if (error) throw new Error(error.message);
      
      // Filter out invalid data using type guard
      return (data || []).filter(isCollection);
    },
  });

  return {
    categories: categories || [],
    collections: collections || [],
    isLoading: categoriesLoading || collectionsLoading,
  };
};
