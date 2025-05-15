
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
  
  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
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
        title: "Skin Removida",
        description: "Skin removida do inventário com sucesso.",
      });
      
      // Invalidate both inventory and transactions caches
      invalidateInventory();
      invalidateTransactions();
    } catch (error) {
      toast({
        title: "Erro ao Remover",
        description: "Falha ao remover a skin do inventário.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsSold = (item: InventoryItem | string, sellData: SellData) => {
    // Handle both item object and direct itemId string
    const itemId = typeof item === 'string' ? item : item.id;
    sellSkin.mutate({ itemId: itemId, sellData: sellData });
    handleClose();
    
    // Invalidate both inventory and transactions caches
    invalidateInventory();
    invalidateTransactions();
  };
  
  const handleDuplicate = async (item: InventoryItem | Skin) => {
    try {
      // Basic purchase info for duplication
      const purchaseInfo = {
        purchasePrice: ('price' in item && typeof item.price === 'number') ? item.price : 0,
        marketplace: "Duplicated",
        feePercentage: 0,
        currency: "USD"
      };
      
      await addSkin.mutateAsync({ skin: item, purchaseInfo: purchaseInfo });
      toast({
        title: "Skin Duplicada",
        description: "Skin duplicada para o inventário com sucesso.",
      });
      
      // Invalidate both inventory and transactions caches
      invalidateInventory();
      invalidateTransactions();
    } catch (error) {
      toast({
        title: "Erro ao Duplicar",
        description: "Falha ao duplicar a skin para o inventário.",
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
        title: "Skin Adicionada",
        description: "Skin adicionada ao inventário com sucesso.",
      });
      
      // Invalidate both inventory and transactions caches
      invalidateInventory();
      invalidateTransactions();
      
      return result;
    } catch (error) {
      toast({
        title: "Erro ao Adicionar",
        description: "Falha ao adicionar a skin ao inventário.",
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
