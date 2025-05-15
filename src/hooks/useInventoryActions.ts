
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
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add' | 'sell'>('view');
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
    // Check if the item has sell mode flag
    if (item.sellMode) {
      setModalMode('sell');
    } else {
      setModalMode('edit');
    }
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  // Alias to maintain API compatibility
  const handleEdit = handleEditItem;

  const handleSellItem = (item: InventoryItem) => {
    console.log("Opening sell modal for item:", item);
    setSelectedItem(item);
    setModalMode('sell');
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

  const handleMarkAsSold = async (itemId: string, sellData: SellData): Promise<void> => {
    try {
      // Handle both item object and direct itemId string
      if (!itemId) {
        console.error("Cannot mark as sold - no item ID found");
        return;
      }
      
      console.log("Marking item as sold:", { itemId, sellData });
      
      await sellSkin.mutateAsync({ itemId, sellData });
      
      toast({
        title: "Skin Sold",
        description: "Skin successfully marked as sold.",
      });
      
      // Invalidate both inventory and transactions caches
      invalidateInventory();
      invalidateTransactions();
      handleClose();
    } catch (error) {
      console.error("Error marking item as sold:", error);
      toast({
        title: "Error Selling",
        description: "Failed to mark the skin as sold.",
        variant: "destructive"
      });
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
    // Reset mode to default
    setModalMode('view');
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
    modalMode,
    setIsModalOpen,
    setIsDetailModalOpen,
    handleViewDetails,
    handleEditItem,
    handleEdit, // Add the alias
    handleDeleteItem,
    handleMarkAsSold,
    handleSellItem,
    handleDuplicate,
    handleAddToInventory, // Export the new function
    handleClose,
    handleCloseDetail
  };
};
