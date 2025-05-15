
import { v4 as uuidv4 } from 'uuid';
import { InventoryItem, SellData, Transaction } from "@/types/skin";
import { supabase } from '@/integrations/supabase/client';
import { mapSupabaseToTransaction } from './inventory-mapper';

export const fetchSoldItems = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user || !userData?.user.id) {
      throw new Error("User not authenticated");
    }
    
    const userId = userData.user.id;
    
    // Fetch sold items from transactions table instead of inventory
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*, inventory(*)')
      .eq('user_id', userId)
      .eq('type', 'sell')
      .order('date', { ascending: false });
      
    if (transactionsError) {
      console.error("Error fetching sold items transactions:", transactionsError);
      return [];
    }
    
    console.log("Raw sold items data from transactions:", transactionsData);
    
    // Map transaction data to the expected format for the UI
    const mappedItems = transactionsData.map(transaction => {
      // Make sure inventory is not null/undefined before accessing its properties
      const inventoryItem = transaction.inventory || {};
      
      return {
        id: transaction.id,
        inventoryId: transaction.item_id,
        skin_id: inventoryItem.skin_id || transaction.item_id,
        name: transaction.skin_name || inventoryItem.name || "Unknown Skin",
        weapon: transaction.weapon_name || inventoryItem.weapon || "Unknown Weapon",
        image: inventoryItem.image || "",
        rarity: inventoryItem.rarity || "Unknown",
        // For sold items, price represents the sold price
        price: transaction.price || 0,
        purchasePrice: inventoryItem.purchase_price || 0,
        acquiredDate: inventoryItem.acquired_date || new Date().toISOString(),
        user_id: transaction.user_id,
        isInUserInventory: false,
        is_in_user_inventory: false,
        tradeLockDays: inventoryItem.trade_lock_days,
        tradeLockUntil: inventoryItem.trade_lock_until,
        // Calculate profit
        profit: (transaction.price || 0) - (inventoryItem.purchase_price || 0),
        currency: transaction.currency_code || 'USD',
        floatValue: inventoryItem.float_value,
        isStatTrak: inventoryItem.is_stat_trak,
        wear: inventoryItem.wear || "",
        // For sold items, we use these fields
        date_sold: transaction.date,
        sold_price: transaction.price,
        sold_marketplace: inventoryItem.marketplace || transaction.notes || "Unknown",
        sold_fee_percentage: inventoryItem.fee_percentage
      };
    });
    
    console.log("Mapped sold items for UI:", mappedItems);
    return mappedItems;
  } catch (error) {
    console.error("Error fetching sold items:", error);
    return [];
  }
};

// Updated user inventory function with proper type mappings
export const fetchUserInventory = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user || !userData?.user.id) {
      console.log("No authenticated user found");
      return [];
    }
    
    const userId = userData.user.id;
    console.log("Fetching inventory for user:", userId);
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('is_in_user_inventory', true)
      .order('acquired_date', { ascending: false });
      
    if (error) {
      console.error("Error fetching inventory:", error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} items in inventory`);
    
    // Ensure all required properties are present and properly formatted
    const inventory = data.map(item => ({
      id: item.id,
      inventoryId: item.id,
      skin_id: item.skin_id,
      name: item.name,
      weapon: item.weapon || "",
      image: item.image || "",
      rarity: item.rarity || "Unknown", // Make sure rarity is never undefined
      price: item.price || 0,
      purchasePrice: item.purchase_price || 0, // Required field
      purchase_price: item.purchase_price,
      acquiredDate: item.acquired_date || new Date().toISOString(),
      acquired_date: item.acquired_date,
      user_id: item.user_id,
      isInUserInventory: true,
      is_in_user_inventory: true,
      tradeLockDays: item.trade_lock_days,
      tradeLockUntil: item.trade_lock_until,
      floatValue: item.float_value,
      float_value: item.float_value,
      isStatTrak: item.is_stat_trak,
      is_stat_trak: item.is_stat_trak,
      wear: item.wear || "",
      condition: item.wear || "",
      marketplace: item.marketplace,
      fee_percentage: item.fee_percentage,
      feePercentage: item.fee_percentage,
      currency: item.currency_code,
      currentPrice: item.current_price || item.price
    }));
    
    return inventory;
  } catch (error) {
    console.error("Error fetching user inventory:", error);
    return [];
  }
};

export const addSkinToInventory = async (skin: any, purchaseInfo: any): Promise<InventoryItem | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user || !userData?.user.id) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;
    const newItemId = uuidv4();
    
    // Make sure skin_id is always set - this will prevent the error
    const skinId = skin.id || newItemId;
    
    const newItem = {
      id: newItemId,
      inventory_id: newItemId,
      skin_id: skinId, // Ensure this is never null
      user_id: userId,
      name: skin.name || "Unknown Skin",
      weapon: skin.weapon || "Unknown Weapon",
      image: skin.image || "",
      rarity: skin.rarity || "Common",
      price: skin.price || 0,
      purchase_price: purchaseInfo.purchasePrice || 0,
      acquired_date: new Date().toISOString(),
      is_in_user_inventory: true,
      trade_lock_days: 0,
      trade_lock_until: null,
      float_value: skin.floatValue || null,
      is_stat_trak: skin.isStatTrak || false,
      wear: skin.wear || null,
      marketplace: purchaseInfo.marketplace || "Unknown",
      fee_percentage: purchaseInfo.feePercentage || 0,
      currency_code: purchaseInfo.currency || "USD",
      current_price: skin.price || 0
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert(newItem)
      .select();

    if (error) {
      console.error("Error adding skin to inventory:", error);
      return null;
    }

    // Create a transaction record for the purchase
    const transactionId = uuidv4();
    const transaction = {
      id: transactionId,
      transaction_id: transactionId,
      user_id: userId,
      type: 'add',
      item_id: newItemId,
      weapon_name: skin.weapon || "Unknown Weapon",
      skin_name: skin.name || "Unknown Skin",
      date: new Date().toISOString(),
      price: purchaseInfo.purchasePrice || 0,
      notes: `Added from ${purchaseInfo.marketplace || "Unknown"}`,
      currency_code: purchaseInfo.currency || "USD"
    };

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transaction);

    if (transactionError) {
      console.error("Error creating add transaction:", transactionError);
      // Continue anyway as the item was added to inventory
    }

    return {
      inventoryId: newItem.id,
      id: newItem.id,
      skin_id: newItem.skin_id,
      name: newItem.name,
      weapon: newItem.weapon,
      image: newItem.image,
      rarity: newItem.rarity,
      price: newItem.price,
      purchasePrice: newItem.purchase_price,
      acquiredDate: newItem.acquired_date,
      userId: newItem.user_id,
      isInUserInventory: newItem.is_in_user_inventory,
      tradeLockDays: newItem.trade_lock_days,
      tradeLockUntil: newItem.trade_lock_until,
      floatValue: newItem.float_value,
      isStatTrak: newItem.is_stat_trak,
      wear: newItem.wear,
      marketplace: newItem.marketplace,
      feePercentage: newItem.fee_percentage,
      currency: newItem.currency_code,
      currentPrice: newItem.current_price
    };
  } catch (error) {
    console.error("Error adding skin to inventory:", error);
    return null;
  }
};

export const removeInventoryItem = async (inventoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', inventoryId);

    if (error) {
      console.error("Error removing item from inventory:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error removing item from inventory:", error);
    return false;
  }
};

export const updateInventoryItem = async (itemId: string, updates: Partial<InventoryItem>): Promise<boolean> => {
  try {
    // Map the property names from the update object to column names in Supabase
    const supabaseUpdates: { [key: string]: any } = {};
    if (updates.purchasePrice !== undefined) supabaseUpdates.purchase_price = updates.purchasePrice;
    if (updates.currentPrice !== undefined) supabaseUpdates.current_price = updates.currentPrice;
    if (updates.tradeLockDays !== undefined) supabaseUpdates.trade_lock_days = updates.tradeLockDays;
    if (updates.tradeLockUntil !== undefined) supabaseUpdates.trade_lock_until = updates.tradeLockUntil;
    if (updates.floatValue !== undefined) supabaseUpdates.float_value = updates.floatValue;
    if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
    if (updates.wear !== undefined) supabaseUpdates.wear = updates.wear;
    if (updates.isStatTrak !== undefined) supabaseUpdates.is_stat_trak = updates.isStatTrak;
    if (updates.marketplace !== undefined) supabaseUpdates.marketplace = updates.marketplace;
    if (updates.feePercentage !== undefined) supabaseUpdates.fee_percentage = updates.feePercentage;
    if (updates.currency !== undefined) supabaseUpdates.currency_code = updates.currency;

    const { error } = await supabase
      .from('inventory')
      .update(supabaseUpdates)
      .eq('id', itemId);

    if (error) {
      console.error("Error updating inventory item:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return false;
  }
};

export const markItemAsSold = async (itemId: string, sellData: SellData): Promise<boolean> => {
  try {
    // Ensure soldDate is properly formatted
    const soldDate = sellData.soldDate ? new Date(sellData.soldDate).toISOString() : new Date().toISOString();
    
    // Get the purchase price to calculate profit
    const { data: item } = await supabase
      .from('inventory')
      .select('purchase_price, name, weapon')
      .eq('id', itemId)
      .single();
    
    if (!item) {
      console.error("Error marking item as sold: Item not found");
      return false;
    }

    const purchasePrice = item?.purchase_price || 0;
    const soldPrice = sellData.soldPrice || 0;
    const profit = soldPrice - purchasePrice;
    
    // Update the inventory item (mark as not in inventory)
    const { error } = await supabase
      .from('inventory')
      .update({
        is_in_user_inventory: false,
        price: soldPrice,
        updated_at: soldDate,
        marketplace: sellData.soldMarketplace,
        fee_percentage: sellData.soldFeePercentage,
        currency_code: sellData.soldCurrency
      })
      .eq('id', itemId);

    if (error) {
      console.error("Error updating inventory item as sold:", error);
      return false;
    }

    // Create a transaction record for the sale
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      console.error("User not authenticated");
      return false;
    }

    const transactionId = uuidv4();
    const transaction = {
      id: transactionId,
      transaction_id: transactionId,
      user_id: userData.user.id,
      type: 'sell',
      item_id: itemId,
      weapon_name: item.weapon || "Unknown Weapon",
      skin_name: item.name || "Unknown Skin",
      date: soldDate,
      price: soldPrice,
      notes: `Sold on ${sellData.soldMarketplace || "Unknown"}`,
      currency_code: sellData.soldCurrency || "USD"
    };

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transaction);

    if (transactionError) {
      console.error("Error creating sell transaction:", transactionError);
      // Sale was marked in inventory, so return true
    }

    // Log successful transaction
    console.log(`Item ${itemId} marked as sold for ${soldPrice} with profit ${profit}`);
    return true;
  } catch (error) {
    console.error("Error marking item as sold:", error);
    return false;
  }
};

// Add a utility function to get current date as string
export const getCurrentDateAsString = (): string => {
  return new Date().toISOString();
};
