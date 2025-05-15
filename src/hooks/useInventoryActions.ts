
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  useAddSkin, 
  useRemoveSkin, 
  useUpdateSkin, 
  useSellSkin, 
  useInvalidateInventory 
} from "@/hooks/use-skins";
import { useInvalidateTransactions } from "@/hooks/useTransactions";
import { InventoryItem, Skin, SellData } from "@/types/skin";

export const useInventoryActions = () => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();
  const addSkin = useAddSkin();
  const removeSkin = useRemoveSkin();
  const updateSkin = useUpdateSkin();
  const sellSkin = useSellSkin();
  const invalidateInventory = useInvalidateInventory();
  
  const invalidateTransactions = useInvalidateTransactions();
  
  const handleViewDetails = (item: InventoryItem | null) => {
    setSelectedItem(item);
    setIsDetailModalOpen(!!item);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  // Alias to maintain API compatibility
  const handleEdit = handleEditItem;

  const handleSellItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (inventoryId: string) => {
    try {
      await removeSkin.mutateAsync(inventoryId);
      toast({
        title: "Skin Removed",
        description: "Skin successfully removed from inventory.",
      });
      
      // Invalidate both inventory and transactions caches
      invalidateInventory();
      invalidateTransactions();
    } catch (error) {
      toast({
        title: "Error Removing",
        description: "Failed to remove the skin from inventory.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsSold = async (item: InventoryItem | string, sellData: SellData) => {
    try {
      // Handle both item object and direct itemId string
      const itemId = typeof item === 'string' ? item : item.id;
      await sellSkin.mutateAsync({ itemId: itemId, sellData: sellData });
      
      toast({
        title: "Skin Sold",
        description: "Skin successfully marked as sold.",
      });
      
      // Invalidate both inventory and transactions caches
      invalidateInventory();
      invalidateTransactions();
      handleClose();
      
      return true;
    } catch (error) {
      toast({
        title: "Error Selling",
        description: "Failed to mark the skin as sold.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleDuplicate = async (item: InventoryItem | Skin) => {
    try {
      // Basic purchase info for duplication
      const purchaseInfo = {
        purchasePrice: ('purchasePrice' in item) ? item.purchasePrice : (item.price || 0),
        marketplace: "Duplicated",
        feePercentage: 0,
        currency: "USD"
      };
      
      // Make sure the item has all required properties for a skin
      const skinToAdd: Skin = {
        id: item.id,
        name: item.name,
        image: item.image,
        weapon: item.weapon || '',
        rarity: item.rarity || '',
        price: ('price' in item) ? item.price : (item.purchasePrice || 0),
        floatValue: item.floatValue,
        isStatTrak: item.isStatTrak || false,
        wear: item.wear || ''
      };
      
      await addSkin.mutateAsync({ skin: skinToAdd, purchaseInfo: purchaseInfo });
      toast({
        title: "Skin Duplicated",
        description: "Skin successfully duplicated to inventory.",
      });
      
      // Invalidate both inventory and transactions caches
      invalidateInventory();
      invalidateTransactions();
    } catch (error) {
      toast({
        title: "Error Duplicating",
        description: "Failed to duplicate the skin to inventory.",
        variant: "destructive"
      });
    }
  };
  
  // Add new function for adding inventory items
  const handleAddToInventory = async (skin: Skin) => {
    try {
      // Basic purchase info for new items
      const purchaseInfo = {
        purchasePrice: skin.price || 0,
        marketplace: "Steam Market",
        feePercentage: 0,
        currency: "USD"
      };
      
      const result = await addSkin.mutateAsync({ skin: skin, purchaseInfo: purchaseInfo });
      
      toast({
        title: "Skin Added",
        description: "Skin successfully added to inventory.",
      });
      
      // Invalidate both inventory and transactions caches
      invalidateInventory();
      invalidateTransactions();
      
      return result;
    } catch (error) {
      toast({
        title: "Error Adding",
        description: "Failed to add the skin to inventory.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  // Return all the functions and state
  return {
    selectedItem,
    isModalOpen,
    isDetailModalOpen,
    setIsModalOpen,
    setIsDetailModalOpen,
    handleViewDetails,
    handleEditItem,
    handleEdit, // Add the alias
    handleDeleteItem,
    handleMarkAsSold,
    handleDuplicate,
    handleAddToInventory, // Export the new function
    handleClose,
    handleCloseDetail
  };
};
