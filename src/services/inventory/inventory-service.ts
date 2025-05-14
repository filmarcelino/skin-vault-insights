
import { Skin, InventoryItem, SellData } from "@/types/skin";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToInventoryItem } from "./inventory-mapper";
import { getCurrentDateAsString } from "@/utils/skin-utils";

export const fetchUserInventory = async (): Promise<InventoryItem[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error("No user session found");
    return [];
  }
  
  console.log("Fetching user inventory");
  
  try {
    const { data: inventoryData, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_in_user_inventory", true)
      .order("acquired_date", { ascending: false });
    
    if (error) {
      console.error("Error fetching inventory:", error);
      throw error;
    }
    
    console.log(`Found ${inventoryData?.length || 0} inventory items`);
    
    // Map the Supabase data to our InventoryItem type
    const inventoryItems = inventoryData.map(mapSupabaseToInventoryItem);
    
    return inventoryItems;
  } catch (error) {
    console.error("Error in fetchUserInventory:", error);
    throw error;
  }
};

export const fetchSoldItems = async (): Promise<InventoryItem[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error("No user session found");
    return [];
  }
  
  console.log("Fetching sold items");
  
  try {
    const { data: transactionsData, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("type", "sell")
      .order("date", { ascending: false });
    
    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
    
    console.log(`Found ${transactionsData?.length || 0} sold items`);
    
    // Map the transactions to inventory items
    const soldItems = transactionsData.map((tx: any) => {
      return {
        id: tx.transaction_id || tx.id,
        skin_id: tx.skin_id,
        name: tx.skin_name,
        weapon: tx.weapon_name,
        image: tx.image_url,
        rarity: tx.rarity,
        price: parseFloat(tx.price) || 0,
        purchase_price: parseFloat(tx.purchase_price) || 0,
        acquired_date: tx.purchase_date || tx.date,
        user_id: tx.user_id,
        is_in_user_inventory: false,
        float_value: tx.float_value,
        is_stat_trak: tx.is_stat_trak,
        condition: tx.condition,
        marketplace: tx.marketplace,
        notes: tx.notes,
        date_sold: tx.date,
        profit: parseFloat(tx.price) - parseFloat(tx.purchase_price)
      };
    });
    
    return soldItems;
  } catch (error) {
    console.error("Error in fetchSoldItems:", error);
    throw error;
  }
};

export const addSkinToInventory = async (skin: Skin, purchaseInfo: any): Promise<InventoryItem | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated");
    }
    
    // Add validation to check if skin is a valid object
    if (!skin || typeof skin !== 'object') {
      console.error("Invalid skin data provided:", skin);
      return null;
    }
    
    // Now check for the name property with a type guard
    if (!('name' in skin) || typeof skin.name !== 'string' || !skin.name) {
      console.error("Invalid skin data: missing or invalid name property", skin);
      return null;
    }
    
    const userId = session.user.id;
    const now = getCurrentDateAsString();
    
    const itemData = {
      skin_id: skin.id || `custom_${Date.now()}`,
      skin_name: skin.name || "Unknown Skin",
      weapon_name: skin.weapon || "Unknown Weapon",
      image_url: skin.image || null,
      price: purchaseInfo.purchasePrice || 0,
      purchase_price: purchaseInfo.purchasePrice || 0,
      current_price: purchaseInfo.purchasePrice || 0,
      rarity: skin.rarity || null,
      type: skin.type || null,
      is_stat_trak: purchaseInfo.isStatTrak || false,
      float_value: purchaseInfo.floatValue || null,
      condition: purchaseInfo.condition || null,
      acquired_date: purchaseInfo.purchaseDate || now,
      user_id: userId,
      is_in_user_inventory: true,
      marketplace: purchaseInfo.marketplace || null,
      notes: purchaseInfo.notes || null,
      fee_percentage: purchaseInfo.feePercentage || 0,
      currency: purchaseInfo.currency || "USD"
    };
    
    const { data, error } = await supabase
      .from("inventory")
      .insert(itemData)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding skin to inventory:", error);
      throw error;
    }
    
    console.log("Skin added to inventory:", data);
    
    // Also log an 'add' transaction for this item
    await logTransaction(data, "add", purchaseInfo.purchasePrice);
    
    return mapSupabaseToInventoryItem(data);
  } catch (error) {
    console.error("Error in addSkinToInventory:", error);
    throw error;
  }
};

export const updateInventoryItem = async (
  itemId: string,
  updates: Partial<InventoryItem>
): Promise<InventoryItem | null> => {
  try {
    console.log("Updating inventory item:", { itemId, updates });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return null;
    }
    
    const { data, error } = await supabase
      .from("inventory")
      .update({
        skin_name: updates.name,
        weapon_name: updates.weapon,
        image_url: updates.image,
        price: updates.price,
        purchase_price: updates.purchase_price,
        current_price: updates.price, // Update current price too
        rarity: updates.rarity,
        float_value: updates.float_value,
        condition: updates.condition,
        is_stat_trak: updates.is_stat_trak,
        marketplace: updates.marketplace,
        notes: updates.notes,
      })
      .eq("id", itemId)
      .eq("user_id", session.user.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating inventory item:", error);
      throw error;
    }
    
    console.log("Inventory item updated:", data);
    
    return mapSupabaseToInventoryItem(data);
  } catch (error) {
    console.error("Error in updateInventoryItem:", error);
    throw error;
  }
};

export const removeInventoryItem = async (itemId: string): Promise<boolean> => {
  try {
    console.log("Removing inventory item:", itemId);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }
    
    // Get the item first for transaction logging
    const { data: itemData, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", session.user.id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching item for removal:", fetchError);
      throw fetchError;
    }
    
    // Now delete the item
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("id", itemId)
      .eq("user_id", session.user.id);
    
    if (error) {
      console.error("Error removing inventory item:", error);
      throw error;
    }
    
    // Log the remove transaction
    await logTransaction(itemData, "remove");
    
    console.log("Inventory item removed successfully");
    
    return true;
  } catch (error) {
    console.error("Error in removeInventoryItem:", error);
    throw error;
  }
};

export const markItemAsSold = async (
  itemId: string,
  sellData: SellData
): Promise<boolean> => {
  try {
    console.log("Marking item as sold:", { itemId, sellData });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }
    
    // Get the item first
    const { data: itemData, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", session.user.id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching item for sale:", fetchError);
      throw fetchError;
    }
    
    // Remove from inventory by updating is_in_user_inventory
    const { error } = await supabase
      .from("inventory")
      .update({
        is_in_user_inventory: false,
        date_sold: sellData.saleDate || getCurrentDateAsString(),
      })
      .eq("id", itemId)
      .eq("user_id", session.user.id);
    
    if (error) {
      console.error("Error marking item as sold:", error);
      throw error;
    }
    
    // Log the sell transaction
    await logTransaction(itemData, "sell", sellData.salePrice, sellData.saleDate);
    
    console.log("Item marked as sold successfully");
    
    return true;
  } catch (error) {
    console.error("Error in markItemAsSold:", error);
    throw error;
  }
};

export const duplicateInventoryItem = async (itemId: string): Promise<InventoryItem | null> => {
  try {
    console.log("Duplicating inventory item:", itemId);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return null;
    }
    
    // Get the item to duplicate
    const { data: itemData, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", session.user.id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching item for duplication:", fetchError);
      throw fetchError;
    }
    
    // Create a new item with the same data but new ID and current date
    const newItemData = {
      ...itemData,
      id: undefined, // Let Supabase generate a new ID
      acquired_date: getCurrentDateAsString(),
    };
    
    const { data, error } = await supabase
      .from("inventory")
      .insert(newItemData)
      .select()
      .single();
    
    if (error) {
      console.error("Error duplicating inventory item:", error);
      throw error;
    }
    
    console.log("Inventory item duplicated:", data);
    
    // Log the add transaction for the duplicate
    await logTransaction(data, "add", data.purchase_price || data.price);
    
    return mapSupabaseToInventoryItem(data);
  } catch (error) {
    console.error("Error in duplicateInventoryItem:", error);
    throw error;
  }
};

async function logTransaction(
  item: any,
  type: "add" | "remove" | "sell",
  price?: number,
  date?: string
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return;
    }
    
    const transactionData = {
      transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: session.user.id,
      item_id: item.id,
      skin_id: item.skin_id,
      skin_name: item.skin_name,
      weapon_name: item.weapon_name,
      image_url: item.image_url,
      type,
      price: price !== undefined ? price : item.price,
      purchase_price: item.purchase_price,
      date: date || getCurrentDateAsString(),
      marketplace: item.marketplace,
      is_stat_trak: item.is_stat_trak,
      float_value: item.float_value,
      rarity: item.rarity,
    };
    
    const { error } = await supabase
      .from("transactions")
      .insert(transactionData);
    
    if (error) {
      console.error("Error logging transaction:", error);
      throw error;
    }
    
    console.log(`Transaction logged: ${type}`, transactionData);
  } catch (error) {
    console.error("Error in logTransaction:", error);
    // Don't throw the error here to prevent it from affecting the main operation
  }
}
