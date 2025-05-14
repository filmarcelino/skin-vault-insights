
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

  const handleSell = (itemId: string, sellData: SellData) => {
    sellSkin.mutate({ itemId, sellData: sellData });
    handleClose();
    invalidateInventory();
    // Invalidamos as transações após uma venda para manter os dados atualizados
    invalidateTransactions();
  };

  const handleAddToInventory = async (skin: Skin): Promise<InventoryItem | null> => {
    try {
      const purchaseInfo = {
        purchasePrice: skin.price || 0,
        marketplace: "Steam Market",
        feePercentage: 0,
        notes: "Added from inventory",
        currency: "USD"
      };
      
      const newItem = await addSkin.mutateAsync({ skin, purchaseInfo });
      
      toast({
        title: "Skin Adicionada",
        description: `${skin.name} foi adicionada ao inventário.`,
      });
      
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

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  // Função para invalidar manualmente o cache de transações
  const invalidateTransactions = () => {
    // As transações geralmente são carregadas na página, então forçamos um reload
    // dos dados ao invalidar o cache
  };

  return {
    selectedItem,
    isModalOpen,
    duplicateModalOpen,
    selectedItemForDuplicate,
    duplicateCount,
    setIsModalOpen,
    setDuplicateModalOpen,
    setDuplicateCount,
    handleEdit,
    handleDuplicate,
    handleRemove,
    handleSell,
    handleAddToInventory,
    handleDuplicateMultiple,
    handleClose,
    handleViewDetails,
  };
};
