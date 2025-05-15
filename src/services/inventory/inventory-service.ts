
import { v4 as uuidv4 } from 'uuid';
import { InventoryItem, SellData } from "@/types/skin";
import { supabase } from '@/integrations/supabase/client'; // Direct import

export const fetchSoldItems = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user || !userData?.user.id) {
      throw new Error("User not authenticated");
    }
    
    const userId = userData.user.id;
    
    // Fetch ALL sold items with no limit and proper sorting
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('is_in_user_inventory', false)
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching sold items:", error);
      return [];
    }
    
    console.log("Raw sold items data from DB:", data);
    
    // Map database fields to the expected format for the UI
    const mappedItems = data.map(item => ({
      id: item.id,
      inventoryId: item.id,
      skin_id: item.skin_id,
      name: item.name,
      weapon: item.weapon || "",
      image: item.image || "",
      rarity: item.rarity || "Unknown",
      // For sold items, price represents the sold price
      price: item.price || 0,
      purchasePrice: item.purchase_price || 0,
      acquiredDate: item.acquired_date || new Date().toISOString(),
      user_id: item.user_id,
      isInUserInventory: false,
      is_in_user_inventory: false,
      tradeLockDays: item.trade_lock_days,
      tradeLockUntil: item.trade_lock_until,
      // Calculate profit
      profit: (item.price || 0) - (item.purchase_price || 0),
      currency: item.currency_code || 'USD',
      floatValue: item.float_value,
      isStatTrak: item.is_stat_trak,
      wear: item.wear || "",
      // For sold items, we use these fields
      date_sold: item.updated_at,
      sold_price: item.price,
      sold_marketplace: item.marketplace || "Unknown",
      sold_fee_percentage: item.fee_percentage
    }));
    
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
    
    const newItem = {
      id: newItemId,
      inventory_id: newItemId, // Add required inventory_id field
      skin_id: skin.id,
      user_id: userId,
      name: skin.name,
      weapon: skin.weapon,
      image: skin.image,
      rarity: skin.rarity,
      price: skin.price,
      purchase_price: purchaseInfo.purchasePrice,
      acquired_date: new Date().toISOString(),
      is_in_user_inventory: true,
      trade_lock_days: 0,
      trade_lock_until: null,
      float_value: skin.floatValue || null,
      is_stat_trak: skin.isStatTrak || false,
      wear: skin.wear || null,
      marketplace: purchaseInfo.marketplace,
      fee_percentage: purchaseInfo.feePercentage,
      currency_code: purchaseInfo.currency,
      current_price: skin.price
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert(newItem)
      .select();

    if (error) {
      console.error("Error adding skin to inventory:", error);
      return null;
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
      .select('purchase_price')
      .eq('id', itemId)
      .single();
    
    const purchasePrice = item?.purchase_price || 0;
    const soldPrice = sellData.soldPrice || 0;
    
    // Store sold information in the existing fields
    // We don't use separate fields like sold_price, instead we use:
    // - price = sold price
    // - updated_at = date sold
    // - marketplace = sold marketplace
    // - fee_percentage = sold fee percentage
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
      console.error("Error marking item as sold:", error);
      return false;
    }

    // Log successful transaction
    console.log(`Item ${itemId} marked as sold for ${soldPrice} with profit ${soldPrice - purchasePrice}`);
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
