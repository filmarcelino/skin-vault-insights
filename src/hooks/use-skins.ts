import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchUserInventory } from "@/services/inventory";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSkins, fetchCollections } from "@/services/api";
import { Skin, SkinFilter } from "@/types/skin";

/**
 * Custom hook to fetch skins with optional filtering
 */
export const useSkins = (filters: SkinFilter = {}) => {
  const { user } = useAuth();
  const userId = user?.id;

  const {
    search = "",
    weapon = "",
    rarity = "",
    onlyUserInventory = false,
    category = "",
    collection = ""
  } = filters;

  // If we're looking for user's inventory only
  if (onlyUserInventory && userId) {
    return useQuery({
      queryKey: ["userInventory", userId],
      queryFn: async () => {
        // Return user's inventory
        return await fetchUserInventory(userId);
      },
      enabled: !!userId // Only fetch if we have a userId
    });
  }

  // Otherwise fetch all skins with filtering
  return useQuery({
    queryKey: ["skins", search, weapon, rarity, category, collection],
    queryFn: async () => {
      // Fetch all skins
      const allSkins = await fetchSkins();
      
      // If no filters, return all skins
      if (!search && !weapon && !rarity && !category && !collection) {
        return allSkins;
      }
      
      // Apply filters
      return allSkins.filter((skin: Skin) => {
        if (search && !skin.name?.toLowerCase().includes(search.toLowerCase()) &&
            !skin.weapon?.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        
        if (weapon && skin.weapon !== weapon) {
          return false;
        }
        
        if (rarity && skin.rarity !== rarity) {
          return false;
        }
        
        if (category && skin.category !== category) {
          return false;
        }
        
        if (collection) {
          if (!skin.collections) return false;
          
          if (typeof skin.collections === 'string') {
            return skin.collections === collection;
          }
          
          if (Array.isArray(skin.collections)) {
            return skin.collections.some(col => col?.name === collection || col?.id === collection);
          }
          
          return false;
        }
        
        return true;
      });
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch available collections
 */
export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    staleTime: 60 * 60 * 1000 // 1 hour
  });
};

/**
 * Helper hook to invalidate inventory cache
 */
export const useInvalidateInventory = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["userInventory"] });
  };
};
