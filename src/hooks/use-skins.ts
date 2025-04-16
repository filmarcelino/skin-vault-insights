
import { useQuery } from "@tanstack/react-query";
import { 
  fetchSkins, 
  fetchSkinById, 
  fetchWeapons, 
  fetchCollections, 
  searchSkins 
} from "@/services/api";
import { Skin, SkinFilter, SkinCollection } from "@/types/skin";
import { getUserInventory } from "@/services/inventory-service";
import { useQueryClient } from "@tanstack/react-query";

// Custom key for inventory data
export const INVENTORY_QUERY_KEY = "user-inventory";
export const SKINS_QUERY_KEY = "skins";

export const useSkins = (filters?: SkinFilter) => {
  return useQuery({
    queryKey: filters?.onlyUserInventory ? [INVENTORY_QUERY_KEY] : [SKINS_QUERY_KEY, filters],
    queryFn: async () => {
      // If we want only user inventory, return it from local storage
      if (filters?.onlyUserInventory) {
        return getUserInventory();
      }
      // Otherwise fetch from API
      return fetchSkins(filters);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useInvalidateInventory = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate inventory query to force a refresh
    queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
  };
};

export const useSkinById = (id: string) => {
  return useQuery({
    queryKey: ["skin", id],
    queryFn: () => fetchSkinById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
};

export const useWeapons = () => {
  return useQuery({
    queryKey: ["weapons"],
    queryFn: fetchWeapons,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSearchSkins = (query: string) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchSkins(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: query.length > 2, // Only search with at least 3 characters
  });
};
