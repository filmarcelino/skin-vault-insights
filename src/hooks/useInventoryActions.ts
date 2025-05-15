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

  const handleMarkAsSold = (item: InventoryItem, sellData: SellData) => {
    sellSkin.mutate({ itemId: item.id, sellData: sellData });
    handleClose();
    
    // Invalidate both inventory and transactions caches
    invalidateInventory();
    invalidateTransactions();
  };
  
  const handleDuplicate = async (skin: Skin) => {
    try {
      // Basic purchase info for duplication
      const purchaseInfo = {
        purchasePrice: skin.price || 0,
        marketplace: "Duplicated",
        feePercentage: 0,
        currency: "USD"
      };
      
      await addSkin.mutateAsync({ skin: skin, purchaseInfo: purchaseInfo });
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
    handleDeleteItem,
    handleMarkAsSold,
    handleDuplicate,
    handleClose,
    handleCloseDetail
  };
};
