// This function needs to be added or updated to ensure it returns items matching the InventoryItem interface
export const fetchSoldItems = async () => {
  try {
    const { data: supabase } = await import('@/integrations/supabase/client');
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.id) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*, transactions(*)')
      .eq('user_id', user.id)
      .eq('is_in_user_inventory', false)
      .order('date_sold', { ascending: false });
      
    if (error) {
      console.error("Error fetching sold items:", error);
      return [];
    }
    
    // Ensure all required properties are present and properly formatted
    const mappedItems = data.map(item => ({
      id: item.id,
      inventoryId: item.id,
      skin_id: item.skin_id,
      name: item.name,
      weapon: item.weapon_name,
      image: item.image_url,
      rarity: item.rarity || "Unknown", // Make sure rarity is never undefined
      price: item.price || 0,
      purchasePrice: item.purchase_price || 0, // Required field
      acquiredDate: item.acquired_date || new Date().toISOString(),
      acquired_date: item.acquired_date,
      user_id: item.user_id,
      isInUserInventory: false,
      is_in_user_inventory: false,
      date_sold: item.date_sold,
      sold_price: item.sold_price,
      sold_marketplace: item.sold_marketplace,
      sold_fee_percentage: item.sold_fee_percentage,
      tradeLockDays: item.trade_lock_days,
      tradeLockUntil: item.trade_lock_until,
      profit: item.profit || 0,
      currency: item.currency || 'USD',
      floatValue: item.float_value,
      isStatTrak: item.is_stat_trak,
      wear: item.condition
    }));
    
    return mappedItems;
  } catch (error) {
    console.error("Error fetching sold items:", error);
    return [];
  }
};

// Updated user inventory function with proper type mappings
export const fetchUserInventory = async () => {
  try {
    const { data: supabase } = await import('@/integrations/supabase/client');
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.id) {
      console.log("No authenticated user found");
      return [];
    }
    
    console.log("Fetching inventory for user:", user.id);
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id)
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
      weapon: item.weapon_name,
      image: item.image_url,
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
      wear: item.condition,
      condition: item.condition,
      marketplace: item.marketplace,
      fee_percentage: item.fee_percentage,
      feePercentage: item.feePercentage,
      currency: item.currency,
      currentPrice: item.current_price || item.price
    }));
    
    return inventory;
  } catch (error) {
    console.error("Error fetching user inventory:", error);
    return [];
  }
};

import { InventoryItem, SellData } from "@/types/skin";

const { v4: uuidv4 } = require('uuid');

export const addSkinToInventory = async (skin: any, purchaseInfo: any): Promise<InventoryItem | null> => {
  try {
    const { data: supabase } = await import('@/integrations/supabase/client');
    const { data: user } = await supabase.auth.getUser();

    if (!user || !user.id) {
      throw new Error("User not authenticated");
    }

    const newItem = {
      id: uuidv4(),
      skin_id: skin.id,
      user_id: user.id,
      name: skin.name,
      weapon_name: skin.weapon,
      image_url: skin.image,
      rarity: skin.rarity,
      price: skin.price,
      purchase_price: purchaseInfo.purchasePrice,
      acquired_date: new Date().toISOString(),
      is_in_user_inventory: true,
      trade_lock_days: 0,
      trade_lock_until: null,
      float_value: skin.floatValue || null,
      is_stat_trak: skin.isStatTrak || false,
      condition: skin.wear || null,
      marketplace: purchaseInfo.marketplace,
      fee_percentage: purchaseInfo.feePercentage,
      currency: purchaseInfo.currency,
      current_price: skin.price
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert([newItem])
      .select()

    if (error) {
      console.error("Error adding skin to inventory:", error);
      return null;
    }

    return {
      inventoryId: newItem.id,
      id: newItem.id,
      skin_id: newItem.skin_id,
      name: newItem.name,
      weapon: newItem.weapon_name,
      image: newItem.image_url,
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
      wear: newItem.condition,
      marketplace: newItem.marketplace,
      feePercentage: newItem.fee_percentage,
      currency: newItem.currency,
      currentPrice: newItem.current_price
    };
  } catch (error) {
    console.error("Error adding skin to inventory:", error);
    return null;
  }
};

export const removeInventoryItem = async (inventoryId: string): Promise<boolean> => {
  try {
    const { data: supabase } = await import('@/integrations/supabase/client');

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
    const { data: supabase } = await import('@/integrations/supabase/client');

    // Mapear os nomes das propriedades do objeto de atualização para os nomes das colunas no Supabase
    const supabaseUpdates: { [key: string]: any } = {};
    if (updates.purchasePrice !== undefined) supabaseUpdates.purchase_price = updates.purchasePrice;
    if (updates.currentPrice !== undefined) supabaseUpdates.current_price = updates.currentPrice;
    if (updates.tradeLockDays !== undefined) supabaseUpdates.trade_lock_days = updates.tradeLockDays;
    if (updates.tradeLockUntil !== undefined) supabaseUpdates.trade_lock_until = updates.tradeLockUntil;
    if (updates.floatValue !== undefined) supabaseUpdates.float_value = updates.floatValue;
    if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
    if (updates.wear !== undefined) supabaseUpdates.condition = updates.wear;
    if (updates.isStatTrak !== undefined) supabaseUpdates.is_stat_trak = updates.isStatTrak;
    if (updates.marketplace !== undefined) supabaseUpdates.marketplace = updates.marketplace;
    if (updates.feePercentage !== undefined) supabaseUpdates.fee_percentage = updates.feePercentage;
    if (updates.currency !== undefined) supabaseUpdates.currency = updates.currency;

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
    const { data: supabase } = await import('@/integrations/supabase/client');

    // Ensure soldDate is properly formatted
    const soldDate = sellData.soldDate ? new Date(sellData.soldDate).toISOString() : new Date().toISOString();

    const { error } = await supabase
      .from('inventory')
      .update({
        is_in_user_inventory: false,
        date_sold: soldDate,
        sold_price: sellData.soldPrice,
        sold_marketplace: sellData.soldMarketplace,
        sold_fee_percentage: sellData.soldFeePercentage,
        profit: sellData.profit,
        currency: sellData.soldCurrency
      })
      .eq('id', itemId);

    if (error) {
      console.error("Error marking item as sold:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking item as sold:", error);
    return false;
  }
};
