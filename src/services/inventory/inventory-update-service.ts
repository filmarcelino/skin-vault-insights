
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, SellData } from "@/types/skin";
import { v4 as uuidv4 } from "uuid";
import { addTransaction } from "./transactions-service";
import { getCurrentDateAsString } from "./inventory-fetch-service";

// Update an existing inventory item - update for consistent parameter object
export const updateInventoryItem = async ({
  itemId,
  updates
}: {
  itemId: string,
  updates: Partial<InventoryItem>
}): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!itemId) {
      return { success: false, error: "No inventory ID provided" };
    }

    // Map frontend model to database schema
    const dbUpdates: any = {
      name: updates.name,
      weapon: updates.weapon,
      rarity: updates.rarity,
      image: updates.image,
      price: updates.price,
      current_price: updates.price,
      purchase_price: updates.purchasePrice,
      acquired_date: updates.acquiredDate,
      is_stat_trak: updates.isStatTrak,
      float_value: updates.floatValue,
      wear: updates.wear,
      marketplace: updates.marketplace,
      fee_percentage: updates.feePercentage,
      notes: updates.notes,
      updated_at: getCurrentDateAsString()
    };

    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });

    // Update the inventory item
    const { error } = await supabase
      .from("inventory")
      .update(dbUpdates)
      .eq("inventory_id", itemId);

    if (error) {
      console.error("Error updating inventory item:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception in updateInventoryItem:", error);
    return { success: false, error };
  }
};

// Remove an item from inventory - update for consistent parameter object
export const removeInventoryItem = async ({
  inventoryId
}: {
  inventoryId: string
}): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!inventoryId) {
      return { success: false, error: "No inventory ID provided" };
    }

    // Delete the inventory item
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("inventory_id", inventoryId);

    if (error) {
      console.error("Error removing inventory item:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception in removeInventoryItem:", error);
    return { success: false, error };
  }
};

// Mark an inventory item as sold - update for consistent parameter object
export const markItemAsSold = async ({
  inventoryId, 
  sellData
}: {
  inventoryId: string,
  sellData: SellData
}): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!inventoryId || !sellData) {
      return { success: false, error: "Missing required parameters" };
    }

    // Get the current item data first
    const { data: itemData, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("inventory_id", inventoryId)
      .single();

    if (fetchError || !itemData) {
      console.error("Error fetching inventory item for sale:", fetchError);
      return { success: false, error: fetchError || "Item not found" };
    }

    // Update the item to mark it as sold
    const { error: updateError } = await supabase
      .from("inventory")
      .update({
        is_in_user_inventory: false,
        price: sellData.soldPrice,
        // Add any other fields we want to update
        updated_at: getCurrentDateAsString()
      })
      .eq("inventory_id", inventoryId);

    if (updateError) {
      console.error("Error marking item as sold:", updateError);
      return { success: false, error: updateError };
    }

    // Create a transaction for the sale with proper marketplace field
    await addTransaction({
      id: uuidv4(),
      type: "sell",
      itemId: inventoryId,
      skinName: itemData.name,
      weaponName: itemData.weapon || "",
      price: sellData.soldPrice,
      date: sellData.soldDate || getCurrentDateAsString(),
      userId: itemData.user_id,
      currency: sellData.soldCurrency || "USD",
      marketplace: sellData.soldMarketplace,
      notes: sellData.soldNotes || ""
    });

    return { success: true };
  } catch (error) {
    console.error("Exception in markItemAsSold:", error);
    return { success: false, error };
  }
};
