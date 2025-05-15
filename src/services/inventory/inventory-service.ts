
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, SellData, Skin, Transaction } from "@/types/skin";
import { v4 as uuidv4 } from "uuid";

// Format date as string in a consistent format
export const getCurrentDateAsString = (): string => {
  return new Date().toISOString();
};

// Fetch user's inventory items
export const fetchUserInventory = async (userId?: string): Promise<InventoryItem[]> => {
  try {
    console.log("Fetching user inventory for", userId);
    
    // If no userId is provided, get the current user's id
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      
      if (!userId) {
        console.error("No user ID available to fetch inventory");
        return [];
      }
    }
    
    // Query the inventory table for the user's items that are still in inventory
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("is_in_user_inventory", true);
      
    if (error) {
      console.error("Error fetching inventory:", error);
      return [];
    }
    
    // Transform database items to InventoryItem type
    return data.map((item) => ({
      id: item.skin_id,
      inventoryId: item.inventory_id,
      name: item.name,
      weapon: item.weapon,
      image: item.image,
      rarity: item.rarity,
      wear: item.wear,
      type: item.type,
      isStatTrak: item.is_stat_trak,
      floatValue: item.float_value,
      price: item.current_price || item.price || item.purchase_price || 0,
      purchasePrice: item.purchase_price || 0,
      acquiredDate: item.acquired_date,
      isInUserInventory: item.is_in_user_inventory,
      marketplace: item.marketplace,
      feePercentage: item.fee_percentage,
      notes: item.notes,
      category: item.category,
      tradeLockDays: item.trade_lock_days || 0,
      tradeLockUntil: item.trade_lock_until,
      currency: item.currency_code
    }));
  } catch (error) {
    console.error("Exception fetching inventory:", error);
    return [];
  }
};

// Add a skin to user's inventory
export const addSkinToInventory = async (
  userId: string, 
  skin: Skin, 
  purchaseData: {
    purchasePrice: number;
    acquiredDate?: string;
    marketplace?: string;
    feePercentage?: number;
    isStatTrak?: boolean;
    wear?: string;
    floatValue?: number;
    notes?: string;
    tradeLockDays?: number;
    currencyCode?: string;
  }
): Promise<{ success: boolean; inventoryId?: string; error?: any }> => {
  try {
    console.log("Adding skin to inventory:", skin.name);
    
    const inventoryId = uuidv4();
    const transactionId = uuidv4();
    const now = new Date().toISOString();
    const currencyCode = purchaseData.currencyCode || 'USD';
    
    // Calculate trade lock expiry if applicable
    let tradeLockUntil = null;
    if (purchaseData.tradeLockDays && purchaseData.tradeLockDays > 0) {
      const lockDate = new Date();
      lockDate.setDate(lockDate.getDate() + purchaseData.tradeLockDays);
      tradeLockUntil = lockDate.toISOString();
    }
    
    // Create the inventory item
    const { error: inventoryError } = await supabase.from("inventory").insert({
      inventory_id: inventoryId,
      skin_id: skin.id,
      name: skin.name,
      weapon: skin.weapon,
      image: skin.image,
      rarity: skin.rarity,
      type: skin.type,
      category: skin.category,
      wear: purchaseData.wear || skin.wear,
      price: skin.price,
      current_price: skin.price,
      purchase_price: purchaseData.purchasePrice,
      user_id: userId,
      acquired_date: purchaseData.acquiredDate || now,
      is_in_user_inventory: true,
      is_stat_trak: purchaseData.isStatTrak || false,
      float_value: purchaseData.floatValue || null,
      marketplace: purchaseData.marketplace,
      fee_percentage: purchaseData.feePercentage || 0,
      trade_lock_days: purchaseData.tradeLockDays || 0,
      trade_lock_until: tradeLockUntil,
      currency_code: currencyCode,
      notes: purchaseData.notes,
      created_at: now,
      updated_at: now,
    });
    
    if (inventoryError) {
      console.error("Error adding to inventory:", inventoryError);
      return { success: false, error: inventoryError };
    }
    
    // Create transaction record
    const { error: transactionError } = await supabase.from("transactions").insert({
      transaction_id: transactionId,
      type: "add",
      item_id: inventoryId,
      skin_name: skin.name,
      weapon_name: skin.weapon,
      price: purchaseData.purchasePrice,
      date: purchaseData.acquiredDate || now,
      user_id: userId,
      notes: purchaseData.notes,
      currency_code: currencyCode,
    });
    
    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      // We don't return failure here as the item was added to inventory successfully
    }
    
    return { success: true, inventoryId };
  } catch (error) {
    console.error("Exception adding skin to inventory:", error);
    return { success: false, error };
  }
};

// Update an existing inventory item
export const updateInventoryItem = async (
  userId: string,
  item: InventoryItem,
  updates: Partial<InventoryItem>
): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log("Updating inventory item:", item.inventoryId);
    
    // Ensure the user is authorized to update this item
    const { data: existingItem, error: checkError } = await supabase
      .from("inventory")
      .select("*")
      .eq("inventory_id", item.inventoryId)
      .eq("user_id", userId)
      .single();
      
    if (checkError || !existingItem) {
      console.error("Error verifying ownership or item not found:", checkError);
      return { success: false, error: checkError || new Error("Item not found") };
    }
    
    // Prepare the update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Map fields from updates to database column names
    if (updates.purchasePrice !== undefined) updateData.purchase_price = updates.purchasePrice;
    if (updates.isStatTrak !== undefined) updateData.is_stat_trak = updates.isStatTrak;
    if (updates.wear !== undefined) updateData.wear = updates.wear;
    if (updates.floatValue !== undefined) updateData.float_value = updates.floatValue;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.marketplace !== undefined) updateData.marketplace = updates.marketplace;
    if (updates.feePercentage !== undefined) updateData.fee_percentage = updates.feePercentage;
    if (updates.tradeLockDays !== undefined) {
      updateData.trade_lock_days = updates.tradeLockDays;
      
      // Update trade lock until date if applicable
      if (updates.tradeLockDays > 0) {
        const lockDate = new Date();
        lockDate.setDate(lockDate.getDate() + updates.tradeLockDays);
        updateData.trade_lock_until = lockDate.toISOString();
      } else {
        updateData.trade_lock_until = null;
      }
    }
    
    // Update the inventory item
    const { error: updateError } = await supabase
      .from("inventory")
      .update(updateData)
      .eq("inventory_id", item.inventoryId)
      .eq("user_id", userId);
      
    if (updateError) {
      console.error("Error updating inventory item:", updateError);
      return { success: false, error: updateError };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Exception updating inventory item:", error);
    return { success: false, error };
  }
};

// Remove an item from user's inventory
export const removeInventoryItem = async (
  userId: string,
  inventoryId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log("Removing inventory item:", inventoryId);
    
    // First check if the item belongs to the user
    const { data: existingItem, error: checkError } = await supabase
      .from("inventory")
      .select("*")
      .eq("inventory_id", inventoryId)
      .eq("user_id", userId)
      .single();
      
    if (checkError || !existingItem) {
      console.error("Error verifying ownership or item not found:", checkError);
      return { success: false, error: checkError || new Error("Item not found") };
    }
    
    // Mark the item as removed from inventory (we don't delete it)
    const { error: updateError } = await supabase
      .from("inventory")
      .update({
        is_in_user_inventory: false,
        updated_at: new Date().toISOString()
      })
      .eq("inventory_id", inventoryId)
      .eq("user_id", userId);
      
    if (updateError) {
      console.error("Error removing inventory item:", updateError);
      return { success: false, error: updateError };
    }
    
    // Create a transaction record for the removal
    const transactionId = uuidv4();
    const { error: transactionError } = await supabase.from("transactions").insert({
      transaction_id: transactionId,
      type: "remove",
      item_id: inventoryId,
      skin_name: existingItem.name,
      weapon_name: existingItem.weapon,
      price: 0, // No price for removal
      date: new Date().toISOString(),
      user_id: userId,
      notes: "Item removed from inventory",
      currency_code: existingItem.currency_code || 'USD',
    });
    
    if (transactionError) {
      console.error("Error creating removal transaction:", transactionError);
      // We don't return failure here as the item was removed from inventory successfully
    }
    
    return { success: true };
  } catch (error) {
    console.error("Exception removing inventory item:", error);
    return { success: false, error };
  }
};

// Mark an inventory item as sold
export const markItemAsSold = async (
  userId: string,
  inventoryId: string,
  sellData: SellData
): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log("Marking item as sold:", inventoryId);
    
    // Check if the item exists and belongs to the user
    const { data: existingItem, error: checkError } = await supabase
      .from("inventory")
      .select("*")
      .eq("inventory_id", inventoryId)
      .eq("user_id", userId)
      .single();
      
    if (checkError || !existingItem) {
      console.error("Error verifying ownership or item not found:", checkError);
      return { success: false, error: checkError || new Error("Item not found") };
    }
    
    // Calculate profit
    const purchasePrice = existingItem.purchase_price || 0;
    const soldPrice = sellData.soldPrice || 0;
    const profit = soldPrice - purchasePrice;
    
    // Update the inventory item to mark it as sold
    const { error: updateError } = await supabase
      .from("inventory")
      .update({
        is_in_user_inventory: false,
        updated_at: new Date().toISOString()
      })
      .eq("inventory_id", inventoryId)
      .eq("user_id", userId);
      
    if (updateError) {
      console.error("Error marking item as sold:", updateError);
      return { success: false, error: updateError };
    }
    
    // Create a transaction record for the sale
    const transactionId = uuidv4();
    const soldDate = sellData.soldDate || new Date().toISOString();
    const currencyCode = sellData.soldCurrency || existingItem.currency_code || 'USD';
    
    const { error: transactionError } = await supabase.from("transactions").insert({
      transaction_id: transactionId,
      type: "sell",
      item_id: inventoryId,
      skin_name: existingItem.name,
      weapon_name: existingItem.weapon,
      price: sellData.soldPrice,
      date: soldDate,
      user_id: userId,
      notes: sellData.soldNotes || `Sold on ${sellData.soldMarketplace || ''}`,
      currency_code: currencyCode,
    });
    
    if (transactionError) {
      console.error("Error creating sale transaction:", transactionError);
      // We don't return failure here as the item was marked as sold successfully
    }
    
    return { success: true };
  } catch (error) {
    console.error("Exception marking item as sold:", error);
    return { success: false, error };
  }
};

// Get user transactions
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    console.log("Fetching transactions for user:", userId);
    
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
      
    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      type: item.type,
      itemId: item.item_id,
      skinName: item.skin_name,
      weaponName: item.weapon_name,
      price: item.price || 0,
      date: item.date,
      notes: item.notes,
      userId: item.user_id,
      currency: item.currency_code,
      marketplace: item.marketplace || '' // Fix for marketplace issue
    }));
  } catch (error) {
    console.error("Exception fetching user transactions:", error);
    return [];
  }
};

// Export other utility functions from the file
