
import { useState } from "react";
import { InventoryItem, Skin, SellData } from "@/types/skin";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { addSkinToInventory, updateInventoryItem, markItemAsSold } from "@/services/inventory";

export const useInventoryActions = () => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();

  const handleViewDetails = (item: InventoryItem | null) => {
    setSelectedItem(item);
    setIsModalOpen(!!item);
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
    setIsModalOpen(true);
  };

  const handleSellItem = (item: InventoryItem) => {
    // Mark the item for selling mode
    setSelectedItem({
      ...item,
      sellMode: true
    });
    setIsModalOpen(true);
  };

  const handleSaveSellTransaction = async (itemId: string, sellData: SellData) => {
    if (!user) {
      toast.error(t("auth.login_required"));
      return;
    }

    try {
      const { success, error } = await markItemAsSold(user.id, itemId, sellData);

      if (success) {
        toast.success(t("inventory.item_sold_success"), {
          description: t("inventory.item_sold_description", { 
            price: formatCurrency(sellData.soldPrice) 
          })
        });
        
        // Refresh inventory and transactions data
        queryClient.invalidateQueries({ queryKey: ["userInventory"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        
        // Close the modal
        setIsModalOpen(false);
        setSelectedItem(null);
      } else {
        toast.error(t("inventory.sell_error"), {
          description: error?.message || t("common.unexpected_error")
        });
      }
    } catch (error) {
      console.error("Error selling item:", error);
      toast.error(t("inventory.sell_error"), {
        description: t("common.unexpected_error")
      });
    }
  };

  return {
    selectedItem,
    isModalOpen,
    setIsModalOpen,
    handleViewDetails,
    handleAddToInventory,
    handleSellItem,
    handleSaveSellTransaction
  };
};
