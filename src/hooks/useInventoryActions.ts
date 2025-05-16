
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addSkinToInventory,
  removeInventoryItem,
  updateInventoryItem,
  markItemAsSold
} from "@/services/inventory";
import { InventoryItem, SellData } from "@/types/skin";
import { toast } from "sonner";
import { useState } from "react";

export const useInventoryActions = () => {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Mutation for adding a skin to the inventory
  const addSkinMutation = useMutation({
    mutationFn: (skinData: any) => addSkinToInventory(skinData),
    onSuccess: () => {
      // Invalidate and refetch the inventory query on success
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Skin added to inventory!");
    },
    onError: (error) => {
      console.error("Error adding skin to inventory:", error);
      toast.error("Failed to add skin to inventory");
    },
  });

  // Mutation for updating an inventory item
  const updateItemMutation = useMutation({
    mutationFn: (itemData: any) => updateInventoryItem(itemData),
    onSuccess: () => {
      // Invalidate and refetch the inventory query on success
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Item updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    },
  });

  // Handles opening the edit modal
  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handles opening the detail modal
  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  // Handles adding a new skin
  const handleAddToInventory = (skin: any) => {
    setSelectedItem(skin);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Handler for marking an item as sold
  const handleMarkAsSold = async (inventoryId: string, sellData: SellData) => {
    try {
      await markItemAsSold({ inventoryId }, sellData);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Item marked as sold!");
    } catch (error) {
      console.error("Error selling item:", error);
      toast.error("Failed to mark item as sold");
    }
  };

  // Handler for removing an inventory item
  const handleDeleteItem = async (item: InventoryItem) => {
    try {
      const inventoryId = item.inventoryId || "";
      if (!inventoryId) {
        toast.error("Invalid item ID");
        return;
      }
      await removeInventoryItem({ inventoryId });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Item removed from inventory!");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from inventory");
    }
  };

  // Handler for duplicating an item
  const handleDuplicate = (item: InventoryItem) => {
    const duplicatedItem = { ...item };
    delete duplicatedItem.inventoryId;
    
    addSkinMutation.mutate(duplicatedItem);
  };

  // Handlers for closing modals
  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
  };

  const handleCloseDetail = (open: boolean) => {
    setIsDetailModalOpen(open);
  };

  // Handler specifically for selling an item
  const handleSellItem = (inventoryId: string, sellData: SellData) => {
    handleMarkAsSold(inventoryId, sellData);
  };

  return {
    addSkin: addSkinMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    sellItem: handleSellItem,
    deleteItem: handleDeleteItem,
    handleEdit,
    handleDuplicate,
    handleViewDetails,
    handleAddToInventory,
    selectedItem,
    isModalOpen,
    isDetailModalOpen,
    modalMode,
    setIsModalOpen,
    setIsDetailModalOpen,
    setSelectedItem,
    isLoading: addSkinMutation.isPending || updateItemMutation.isPending,
    // Add the missing handlers
    handleEditItem: handleEdit,
    handleDeleteItem,
    handleMarkAsSold,
    handleSellItem,
    handleClose,
    handleCloseDetail
  };
};
