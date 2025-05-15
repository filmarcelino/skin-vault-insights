
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  useAddSkin, 
  useRemoveSkin, 
  useUpdateSkin, 
  useSellSkin, 
  useInvalidateInventory 
} from "@/hooks/use-skins";
import { InventoryItem, Skin, SellData } from "@/types/skin";

export const useInventoryActions = () => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [selectedItemForDuplicate, setSelectedItemForDuplicate] = useState<InventoryItem | null>(null);
  const [duplicateCount, setDuplicateCount] = useState(1);
  
  const { toast } = useToast();
  const addSkin = useAddSkin();
  const removeSkin = useRemoveSkin();
  const updateSkin = useUpdateSkin();
  const sellSkin = useSellSkin();
  const invalidateInventory = useInvalidateInventory();

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleEditItem = handleEdit; // Alias for compatibility

  const handleDuplicate = (item: InventoryItem) => {
    setSelectedItemForDuplicate(item);
    setDuplicateModalOpen(true);
  };

  const handleRemove = async (inventoryId: string) => {
    try {
      await removeSkin.mutateAsync(inventoryId);
      toast({
        title: "Skin Removida",
        description: "Skin removida do inventário com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Remover",
        description: "Falha ao remover a skin do inventário.",
      });
    } finally {
      invalidateInventory();
      // Também invalidamos as transações para manter os dados atualizados
      invalidateTransactions();
    }
  };

  const handleDeleteItem = handleRemove; // Alias for compatibility

  const handleMarkAsSold = (itemId: string, sellData: SellData) => {
    sellSkin.mutate({ itemId, sellData: sellData });
    handleClose();
    invalidateInventory();
    // Invalidamos as transações após uma venda para manter os dados atualizados
    invalidateTransactions();
  };

  const handleAddToInventory = async (skin: Skin): Promise<InventoryItem | null> => {
    try {
      if (!skin) {
        console.error("Invalid skin data provided:", skin);
        toast({
          title: "Erro ao Adicionar",
          description: "Dados da skin inválidos.",
          variant: "destructive"
        });
        return null;
      }

      // Make sure we have all required properties for a Skin
      const validSkin: Skin = {
        ...skin,
        rarity: skin.rarity || "Common",
        price: skin.price || 0,
        category: skin.category || "Normal"
      };
      
      const purchaseInfo = {
        purchasePrice: skin.price || 0,
        marketplace: "Steam Market",
        feePercentage: 0,
        notes: "Added from inventory",
        currency: "USD"
      };
      
      const newItem = await addSkin.mutateAsync({ skin: validSkin, purchaseInfo });
      
      if (newItem) {
        toast({
          title: "Skin Adicionada",
          description: `${skin.name || 'Nova skin'} foi adicionada ao inventário.`,
        });
      }
      
      invalidateInventory();
      return newItem;
    } catch (error) {
      console.error("Error adding skin:", error);
      toast({
        title: "Erro ao Adicionar",
        description: "Falha ao adicionar skin ao inventário.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleDuplicateMultiple = async (count: number) => {
    if (!selectedItemForDuplicate) return;
    
    try {
      for (let i = 0; i < count; i++) {
        await handleAddToInventory(selectedItemForDuplicate);
      }
      
      toast({
        title: "Skins Duplicadas",
        description: `${count} cópias foram adicionadas ao inventário.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao Duplicar",
        description: "Falha ao duplicar as skins.",
        variant: "destructive",
      });
    } finally {
      setDuplicateModalOpen(false);
      setDuplicateCount(1);
      setSelectedItemForDuplicate(null);
      invalidateInventory();
    }
  };

  // Add these missing functions
  const handleDuplicateCountChange = (count: number) => {
    setDuplicateCount(count);
  };

  const handleConfirmDuplicate = () => {
    handleDuplicateMultiple(duplicateCount);
  };

  const handleCloseDuplicateModal = () => {
    setDuplicateModalOpen(false);
    setDuplicateCount(1);
    setSelectedItemForDuplicate(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };
  
  // Função para invalidar manualmente o cache de transações
  const invalidateTransactions = () => {
    // As transações geralmente são carregadas na página, então forçamos um reload
    // dos dados ao invalidar o cache
    try {
      const queryClient = require('@tanstack/react-query').queryClient;
      queryClient?.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error) {
      console.log("Failed to invalidate transactions cache:", error);
      // Fallback - we don't need to do anything here as the page will reload on navigation
    }
  };

  return {
    selectedItem,
    isModalOpen,
    isDetailModalOpen,
    duplicateModalOpen,
    selectedItemForDuplicate,
    duplicateCount,
    setIsModalOpen,
    setIsDetailModalOpen,
    setDuplicateModalOpen,
    setDuplicateCount,
    setSelectedItem,
    setSelectedItemForDuplicate,
    handleEdit,
    handleEditItem,
    handleDuplicate,
    handleRemove,
    handleDeleteItem,
    handleMarkAsSold,
    handleSell: handleMarkAsSold,
    handleAddToInventory,
    handleDuplicateMultiple,
    handleClose,
    handleCloseDetail,
    handleViewDetails,
    handleDuplicateCountChange,
    handleConfirmDuplicate,
    handleCloseDuplicateModal
  };
};
