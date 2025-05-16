
import { supabase } from "@/integrations/supabase/client";
import { Skin, InventoryItem, SellData, Transaction } from "@/types/skin";
import { v4 as uuidv4 } from "uuid";
import { mapSupabaseToInventoryItem, mapSupabaseToTransaction } from "./inventory-mapper";
import { addTransaction } from "./transactions-service";

// Helper to get the current date as ISO string
export const getCurrentDateAsString = (): string => {
  return new Date().toISOString();
};

// Fetch user's inventory
export const fetchUserInventory = async (userId: string): Promise<InventoryItem[]> => {
  if (!userId) {
    console.error("fetchUserInventory: No userId provided");
    return [];
  }

  try {
    console.log(`Fetching inventory for user: ${userId}`);
    
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("is_in_user_inventory", true)
      .order("acquired_date", { ascending: false });

    if (error) {
      console.error("Error fetching inventory:", error);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      console.log("No inventory data found or invalid data format");
      return [];
    }

    console.log(`Found ${data.length} items in inventory`);
    return data.map(item => {
      // Handle missing or default properties
      return mapSupabaseToInventoryItem({
        ...item,
        // Add defaults for any missing properties
        type: "Normal", // This is necessary since item.type doesn't exist in DB
        category: item.collection_name || "Normal" // Use collection_name as fallback for category
      });
    });
  } catch (error) {
    console.error("Exception in fetchUserInventory:", error);
    return [];
  }
};

// Fetch sold items
export const fetchSoldItems = async (userId?: string): Promise<InventoryItem[]> => {
  try {
    // Get the current user if userId isn't provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      
      if (!userId) {
        console.error("fetchSoldItems: No user authenticated and no userId provided");
        return [];
      }
    }

    console.log(`Fetching sold items for user: ${userId}`);
    
    const { data: soldData, error: soldError } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("is_in_user_inventory", false)
      .order("acquired_date", { ascending: false });

    if (soldError) {
      console.error("Error fetching sold items:", soldError);
      return [];
    }

    return soldData?.map(item => mapSupabaseToInventoryItem({
      ...item,
      // Add defaults for any missing properties
      type: "Normal", // Add type property
      category: item.collection_name || "Normal" // Use collection_name as fallback for category
    })) || [];
  } catch (error) {
    console.error("Exception in fetchSoldItems:", error);
    return [];
  }
};

// Add a skin to the user's inventory
export const addSkinToInventory = async (
  userId: string,
  skin: Skin,
  options: {
    purchasePrice?: number;
    marketplace?: string;
    feePercentage?: number;
    notes?: string;
    acquiredDate?: string;
    isStatTrak?: boolean;
    floatValue?: number;
    wear?: string;
  } = {}
): Promise<{ success: boolean; inventoryId?: string; error?: any }> => {
  try {
    if (!userId || !skin) {
      console.error("addSkinToInventory: Missing required parameters");
      return { success: false, error: "Missing required parameters" };
    }

    const inventoryId = `inv_${uuidv4()}`;
    const now = getCurrentDateAsString();
    
    // Prepare data for insertion into 'inventory' table
    const inventoryData = {
      inventory_id: inventoryId,
      skin_id: skin.id,
      user_id: userId,
      name: skin.name,
      weapon: skin.weapon,
      rarity: skin.rarity,
      image: skin.image,
      price: skin.price || 0,
      current_price: skin.price || 0,
      purchase_price: options.purchasePrice || skin.price || 0,
      acquired_date: options.acquiredDate || now,
      is_in_user_inventory: true,
      is_stat_trak: options.isStatTrak || false,
      float_value: options.floatValue || null,
      wear: options.wear || skin.wear || "Factory New",
      marketplace: options.marketplace || "Steam Market",
      fee_percentage: options.feePercentage || 15,
      notes: options.notes || "",
      currency_code: "USD", // Default currency
      collection_name: Array.isArray(skin.collections) && skin.collections.length > 0 
        ? skin.collections[0] 
        : null,
    };

    // Insert the item into inventory
    const { error: inventoryError } = await supabase
      .from("inventory")
      .insert(inventoryData);

    if (inventoryError) {
      console.error("Error adding skin to inventory:", inventoryError);
      return { success: false, error: inventoryError };
    }

    // Create a transaction record
    await addTransaction({
      type: "add",
      itemId: inventoryId,
      skinName: skin.name,
      weaponName: skin.weapon || "",
      price: options.purchasePrice || skin.price || 0,
      date: options.acquiredDate || now,
      userId,
      currency: "USD",
      marketplace: options.marketplace,
      notes: options.notes
    });

    return { success: true, inventoryId };
  } catch (error) {
    console.error("Exception in addSkinToInventory:", error);
    return { success: false, error };
  }
};

// Update an existing inventory item
export const updateInventoryItem = async (
  itemId: string,
  updates: Partial<InventoryItem>
): Promise<{ success: boolean; error?: any }> => {
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

// Remove an item from inventory
export const removeInventoryItem = async (
  inventoryId: string
): Promise<{ success: boolean; error?: any }> => {
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

// Mark an inventory item as sold
export const markItemAsSold = async (
  itemId: string,
  sellData: SellData
): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!itemId || !sellData) {
      return { success: false, error: "Missing required parameters" };
    }

    // Get the current item data first
    const { data: itemData, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("inventory_id", itemId)
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
      .eq("inventory_id", itemId);

    if (updateError) {
      console.error("Error marking item as sold:", updateError);
      return { success: false, error: updateError };
    }

    // Create a transaction for the sale
    await addTransaction({
      type: "sell",
      itemId: itemId,
      skinName: itemData.name,
      weaponName: itemData.weapon || "",
      price: sellData.soldPrice,
      date: sellData.soldDate || getCurrentDateAsString(),
      userId: itemData.user_id,
      currency: sellData.currency || "USD",
      marketplace: sellData.marketplace || itemData.marketplace || "Steam Market",
      notes: sellData.notes
    });

    return { success: true };
  } catch (error) {
    console.error("Exception in markItemAsSold:", error);
    return { success: false, error };
  }
};

// Get all transactions for a user
export const getUserTransactions = async (userId?: string): Promise<Transaction[]> => {
  try {
    // Get the current user if userId isn't provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      
      if (!userId) {
        console.error("getUserTransactions: No user authenticated and no userId provided");
        return [];
      }
    }

    // Get all transactions for this user
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }

    // Return empty array if no transactions
    if (!data || data.length === 0) {
      return [];
    }

    // Convert from database schema to frontend model
    return data.map(item => mapSupabaseToTransaction({
      ...item,
      marketplace: item.marketplace || "Steam Market" // Provide fallback
    }));
  } catch (error) {
    console.error("Exception in getUserTransactions:", error);
    return [];
  }
};

// Get a transaction by ID
export const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (error || !data) {
      console.error("Error fetching transaction:", error);
      return null;
    }

    // Map database fields to our frontend model
    return {
      id: data.id,
      type: data.type as "add" | "sell" | "trade" | "buy",
      itemId: data.item_id,
      skinName: data.skin_name || "",
      weaponName: data.weapon_name || "",
      price: data.price || 0,
      date: data.date,
      userId: data.user_id,
      image: null, // DB doesn't store this
      purchasePrice: null, // Not stored in transactions table
      acquiredDate: null, // Not stored in transactions table
      category: null, // Not in transactions table
      rarity: null, // Not in transactions table
      wear: null, // Not in transactions table
      marketplace: data.marketplace || "Unknown", // Providing default value
      profit: null, // Would need to be calculated
      notes: data.notes || "",
      currency: data.currency_code || "USD"
    };
  } catch (error) {
    console.error("Exception in getTransactionById:", error);
    return null;
  }
};
