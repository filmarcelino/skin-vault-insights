import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addSkinToInventory,
  removeInventoryItem,
  updateInventoryItem,
  markItemAsSold
} from "@/services/inventory";
import { InventoryItem, SellData } from "@/types/skin";
import { toast } from "@/components/ui/sonner";

export const useInventoryActions = () => {
  const queryClient = useQueryClient();

  // Mutation for adding a skin to the inventory
  const addSkinMutation = useMutation(
    (skinData: Omit<InventoryItem, 'inventoryId'>) => addSkinToInventory(skinData),
    {
      onSuccess: () => {
        // Invalidate and refetch the inventory query on success
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        toast.success("Skin added to inventory!");
      },
      onError: (error) => {
        console.error("Error adding skin to inventory:", error);
        toast.error("Failed to add skin to inventory");
      },
    }
  );

  // Mutation for updating an inventory item
  const updateItemMutation = useMutation(
    (itemData: InventoryItem) => updateInventoryItem(itemData),
    {
      onSuccess: () => {
        // Invalidate and refetch the inventory query on success
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        toast.success("Item updated successfully!");
      },
      onError: (error) => {
        console.error("Error updating item:", error);
        toast.error("Failed to update item");
      },
    }
  );

  // Mutation for marking an item as sold
  const handleSellItem = async (inventoryId: string, sellData: SellData) => {
    try {
      await markItemAsSold(inventoryId, sellData);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Item marked as sold!");
    } catch (error) {
      console.error("Error selling item:", error);
      toast.error("Failed to mark item as sold");
    }
  };

  // Mutation for removing an inventory item
  const handleDeleteItem = async (inventoryId: string) => {
    try {
      await removeInventoryItem(inventoryId);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Item removed from inventory!");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from inventory");
    }
  };

  return {
    addSkin: addSkinMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    sellItem: handleSellItem,
    deleteItem: handleDeleteItem,
    isLoading: addSkinMutation.isLoading || updateItemMutation.isLoading,
  };
};
