
import { useState } from "react";
import { InventoryItem, Skin, SellData } from "@/types/skin";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { 
  addSkinToInventory, 
  updateInventoryItem, 
  markItemAsSold, 
  removeInventoryItem 
} from "@/services/inventory";

export const useInventoryActions = () => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "sell">("view");
  
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();

  const handleViewDetails = (item: InventoryItem | null) => {
    setSelectedItem(item);
    setIsDetailModalOpen(!!item);
  };

  const handleAddToInventory = (skin: Skin) => {
    if (!user) {
      toast.error(t("inventory.login_required"), {
        description: t("inventory.login_to_add")
      });
      return;
    }

    // Convert Skin to InventoryItem for the modal
    const inventoryItem: InventoryItem = {
      ...skin,
      inventoryId: "", // Will be generated when saved
      acquiredDate: new Date().toISOString(),
      purchasePrice: skin.price || 0,
      isInUserInventory: false, // Not yet in inventory
      isStatTrak: false,
      wear: skin.wear || "Factory New",
      rarity: skin.rarity || "Consumer Grade",
      sellMode: false
    };

    setSelectedItem(inventoryItem);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!user || !item.inventoryId) {
      toast.error(t("errors.general"));
      return;
    }
    
    try {
      // Fixed to use removeInventoryItem properly
      const result = await removeInventoryItem(user.id, item.inventoryId);
      
      if (result.success) {
        toast.success(t("inventory.item_removed"), {
          description: t("inventory.item_removed_description", { name: item.name })
        });
        
        // Refresh inventory data
        queryClient.invalidateQueries({ queryKey: ["userInventory"] });
      } else {
        toast.error(t("inventory.remove_error"), {
          description: result.error?.message || t("common.unexpected_error")
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error(t("inventory.remove_error"));
    }
  };

  const handleSellItem = (item: InventoryItem) => {
    // Mark the item for selling mode
    setSelectedItem({
      ...item,
      sellMode: true
    });
    setModalMode("sell");
    setIsModalOpen(true);
  };

  const handleMarkAsSold = async (itemId: string, sellData: SellData) => {
    if (!user) {
      toast.error(t("auth.login_required"));
      return;
    }

    try {
      const { success, error } = await markItemAsSold(user.id, itemId, sellData);

      if (success) {
        toast.success(t("inventory.item_sold_success"), {
          description: t("inventory.item_sold_description", { 
            price: formatPrice(sellData.soldPrice) 
          })
        });
        
        // Refresh inventory and transactions data
        queryClient.invalidateQueries({ queryKey: ["userInventory"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["sold-items"] });
        
        // Close the modal
        setIsModalOpen(false);
        setSelectedItem(null);

        return { success: true };
      } else {
        toast.error(t("inventory.sell_error"), {
          description: error?.message || t("common.unexpected_error")
        });
        return { success: false, error };
      }
    } catch (error) {
      console.error("Error selling item:", error);
      toast.error(t("inventory.sell_error"), {
        description: t("common.unexpected_error")
      });
      return { success: false, error };
    }
  };

  const handleDuplicate = (item: InventoryItem) => {
    if (!user) {
      toast.error(t("auth.login_required"));
      return;
    }
    
    // Make a copy but remove the inventoryId so a new one will be generated
    const duplicatedItem: InventoryItem = {
      ...item,
      inventoryId: "", // Will be generated when saved
      isInUserInventory: false,
      acquiredDate: new Date().toISOString()
    };
    
    setSelectedItem(duplicatedItem);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setIsModalOpen(false);
      // Small delay to prevent flicker when changing items
      setTimeout(() => setSelectedItem(null), 300);
    }
  };

  const handleCloseDetail = (open: boolean) => {
    if (!open) {
      setIsDetailModalOpen(false);
      // Small delay to prevent flicker when changing items
      setTimeout(() => setSelectedItem(null), 300);
    }
  };

  return {
    selectedItem,
    isModalOpen,
    isDetailModalOpen,
    modalMode,
    setIsModalOpen,
    setIsDetailModalOpen,
    handleViewDetails,
    handleAddToInventory,
    handleEditItem,
    handleDeleteItem,
    handleSellItem,
    handleMarkAsSold,
    handleDuplicate,
    handleClose,
    handleCloseDetail
  };
};
