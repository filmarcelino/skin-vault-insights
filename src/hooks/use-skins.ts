
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Skin, InventoryItem } from "@/types/skin";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSkins } from "@/services/api";
import {
  fetchUserInventory,
  addSkinToInventory,
  updateInventoryItem,
  removeInventoryItem
} from "@/services/inventory";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface UseSkinOptions {
  onlyUserInventory?: boolean;
}

// Main hook to fetch skins data (either all skins or user inventory)
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

// Alias for useSkins with onlyUserInventory=true for better semantics
export const useInventory = () => {
  return useSkins({ onlyUserInventory: true });
};

// Hook to invalidate inventory cache
export const useInvalidateInventory = () => {
  const queryClient = useQueryClient();
  
  return () => {
    console.log("Invalidating inventory cache");
    queryClient.invalidateQueries({ queryKey: ["userInventory"] });
  };
};

// Add the missing useAddSkin hook
export const useAddSkin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  
  return useMutation({
    mutationFn: async ({ skin, purchaseInfo }: { 
      skin: Skin, 
      purchaseInfo?: { 
        purchasePrice?: number;
        marketplace?: string;
        feePercentage?: number;
        notes?: string;
      }
    }) => {
      if (!user) throw new Error(t("auth.login_required"));
      
      return addSkinToInventory(
        user.id, 
        skin, 
        {
          purchasePrice: purchaseInfo?.purchasePrice || skin.price || 0,
          marketplace: purchaseInfo?.marketplace || "Steam Market",
          feePercentage: purchaseInfo?.feePercentage || 15,
          notes: purchaseInfo?.notes || "",
          acquiredDate: new Date().toISOString(),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInventory"] });
    }
  });
};

// Add the useCategories hook
export const useCategories = () => {
  return useQuery({
    queryKey: ["skinCategories"],
    queryFn: async () => {
      try {
        const skins = await fetchSkins();
        const categories = [...new Set(skins.map(skin => skin.category).filter(Boolean))];
        return categories as string[];
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
