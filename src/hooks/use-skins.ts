import { useQuery } from "@tanstack/react-query";
import { Skin, InventoryItem } from "@/types/skin";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSkins } from "@/services/api";
import {
  fetchUserInventory,
  addSkinToInventory,
  updateInventoryItem,
  removeInventoryItem
} from "@/services/inventory";

interface UseSkinOptions {
  onlyUserInventory?: boolean;
}

export const useSkins = (options: UseSkinOptions = {}) => {
  const { user, isAuthenticated } = useAuth();
  const { onlyUserInventory = false } = options;
  
  console.log("useSkins hook called with options:", options);

  const fetchSkinData = async (): Promise<Skin[] | InventoryItem[]> => {
    // If only user inventory is requested and user is authenticated, fetch user inventory
    if (onlyUserInventory && isAuthenticated && user) {
      console.log("Fetching user inventory");
      const inventory = await fetchUserInventory(user.id);
      return inventory;
    }
    
    // Otherwise, fetch all skins
    console.log("Fetching all skins");
    const allSkins = await fetchSkins();
    return allSkins;
  };

  return useQuery({
    queryKey: [onlyUserInventory ? "userInventory" : "allSkins", user?.id],
    queryFn: fetchSkinData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: onlyUserInventory ? isAuthenticated : true, // Only enable if not requiring auth or user is authenticated
  });
};
