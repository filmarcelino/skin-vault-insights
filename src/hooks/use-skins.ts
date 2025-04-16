
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchSkinById, 
  fetchWeapons, 
  fetchCollections
} from "@/services/api";
import { 
  getUserInventory, 
  addSkinToInventory,
  removeSkinFromInventory,
  updateInventoryItem,
  sellSkin as sellSkinService
} from "@/services/inventory-service";
import { Skin, SkinFilter, InventoryItem, SellData } from "@/types/skin";

// Custom key for inventory data
export const INVENTORY_QUERY_KEY = "user-inventory";

export const useInventory = () => {
  return useQuery({
    queryKey: [INVENTORY_QUERY_KEY],
    queryFn: async () => {
      try {
        const inventory = await getUserInventory();
        console.log("Loaded inventory:", inventory);
        // Garantir que sempre retornamos um array
        return Array.isArray(inventory) ? inventory : [];
      } catch (error) {
        console.error("Error in useInventory:", error);
        return [];
      }
    },
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useAddSkin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {skin: Skin, purchaseInfo: any}) => {
      console.log("Add skin mutation called with:", data);
      
      // Validate data before proceeding
      if (!data.skin || !data.skin.name) {
        throw new Error("Invalid skin data provided");
      }
      
      const result = await addSkinToInventory(data.skin, data.purchaseInfo);
      if (!result) {
        throw new Error("Failed to add skin to inventory");
      }
      return result;
    },
    onSuccess: () => {
      // Imediatamente invalidar a query para forçar uma atualização
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
    onError: (error) => {
      console.error("Error in addSkin mutation:", error);
    }
  });
};

export const useSellSkin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {itemId: string, sellData: SellData}) => 
      sellSkinService(data.itemId, data.sellData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
};

export const useUpdateSkin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
};

export const useRemoveSkin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeSkinFromInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
};

export const useInvalidateInventory = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
  };
};

export const useSkinById = (id: string) => {
  return useQuery({
    queryKey: ["skin", id],
    queryFn: () => fetchSkinById(id),
    enabled: !!id,
  });
};

export const useWeapons = () => {
  return useQuery({
    queryKey: ["weapons"],
    queryFn: fetchWeapons,
  });
};

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });
};
