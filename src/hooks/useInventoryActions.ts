
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
import { useLanguage } from "@/contexts/LanguageContext";

export const useInventoryActions = () => {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const { t } = useLanguage();

  // Mutation for adding a skin to the inventory
  const addSkinMutation = useMutation({
    mutationFn: (skinData: any) => addSkinToInventory(skinData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(t("inventory.itemAdded"));
    },
    onError: (error) => {
      console.error("Error adding skin to inventory:", error);
      toast.error(t("errors.addSkinFailed"));
    },
  });

  // Mutation for updating an inventory item
  const updateItemMutation = useMutation({
    mutationFn: (itemData: any) => updateInventoryItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(t("inventory.itemUpdated"));
    },
    onError: (error) => {
      console.error("Error updating item:", error);
      toast.error(t("errors.updateItemFailed"));
    },
  });

  // Handles opening the edit modal
  const handleEdit = (item: InventoryItem) => {
    console.log("Editing item:", item);
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handles opening the detail modal
  const handleViewDetails = (item: InventoryItem) => {
    console.log("Viewing details for item:", item);
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  // Handles adding a new skin
  const handleAddToInventory = (skin: any) => {
    console.log("Adding skin to inventory:", skin);
    setSelectedItem(skin);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Handler for marking an item as sold
  const handleMarkAsSold = async (inventoryId: string, sellData: SellData) => {
    try {
      console.log("Marking item as sold:", { inventoryId, sellData });
      await markItemAsSold({ inventoryId, sellData });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(t("inventory.itemSold"));
      return true;
    } catch (error) {
      console.error("Error selling item:", error);
      toast.error(t("errors.sellItemFailed"));
      return false;
    }
  };

  // Handler for removing an inventory item
  const handleDeleteItem = async (item: InventoryItem) => {
    try {
      const inventoryId = item.inventoryId || "";
      if (!inventoryId) {
        toast.error(t("errors.invalidItemId"));
        return false;
      }
      console.log("Removing item:", { inventoryId, item });
      await removeInventoryItem({ inventoryId });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(t("inventory.itemRemoved"));
      return true;
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error(t("errors.removeItemFailed"));
      return false;
    }
  };

  // Handler for duplicating an item
  const handleDuplicate = (item: InventoryItem) => {
    console.log("Duplicating item:", item);
    const duplicatedItem = { ...item };
    delete duplicatedItem.inventoryId;
    
    addSkinMutation.mutate(duplicatedItem);
  };

  // Handler specifically for selling an item
  const handleSellItem = (item: InventoryItem, sellData: SellData) => {
    if (item.inventoryId) {
      console.log("Calling handleMarkAsSold from handleSellItem");
      return handleMarkAsSold(item.inventoryId, sellData);
    }
    return Promise.resolve(false);
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
    handleMarkAsSold,
    selectedItem,
    isModalOpen,
    isDetailModalOpen,
    modalMode,
    setIsModalOpen,
    setIsDetailModalOpen,
    setSelectedItem,
    isLoading: addSkinMutation.isPending || updateItemMutation.isPending,
    handleClose: () => setIsModalOpen(false),
    handleCloseDetail: () => setIsDetailModalOpen(false)
  };
};
