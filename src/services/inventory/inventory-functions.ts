
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, Skin, SellData } from "@/types/skin";
import { v4 as uuidv4 } from "uuid";
import { mapSupabaseToInventoryItem } from "./inventory-mapper";

/**
 * Retrieves the user's inventory from Supabase
 */
export const getUserInventory = async (): Promise<InventoryItem[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return [];
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error getting inventory:", error);
      return [];
    }
    
    return Array.isArray(data) ? data.map(mapSupabaseToInventoryItem).filter(Boolean) as InventoryItem[] : [];
  } catch (error) {
    console.error("Error getting inventory:", error);
    return [];
  }
};

/**
 * Adds a new skin to the user's inventory
 */
export const addSkinToInventory = async (skin: Skin, purchaseInfo: any): Promise<InventoryItem | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return null;
    }
    
    // Ensure skin object is valid
    if (!skin || !skin.name) {
      console.error("Invalid skin data:", skin);
      return null;
    }
    
    const newItem = {
      inventory_id: uuidv4(),
      skin_id: skin.id || uuidv4(),
      user_id: session.user.id,
      name: skin.name,
      weapon: skin.weapon || '',
      wear: skin.wear || '',
      rarity: skin.rarity || '',
      image: skin.image || '',
      price: skin.price || 0,
      current_price: skin.price || 0,
      purchase_price: purchaseInfo?.purchasePrice || skin.price || 0,
      marketplace: purchaseInfo?.marketplace || "Steam Market",
      fee_percentage: purchaseInfo?.feePercentage || 0,
      is_stat_trak: purchaseInfo?.isStatTrak || false,
      trade_lock_days: purchaseInfo?.tradeLockDays || 0,
      trade_lock_until: purchaseInfo?.tradeLockDays ? 
        new Date(Date.now() + purchaseInfo.tradeLockDays * 24 * 60 * 60 * 1000).toISOString() : null,
      float_value: purchaseInfo?.floatValue || null,
      notes: purchaseInfo?.notes || '',
      currency_code: purchaseInfo?.currency || 'USD',
      is_in_user_inventory: true,
      collection_name: skin.collection?.name || null,
      collection_id: skin.collection?.id || null
    };
    
    console.log("Adding item to inventory:", newItem);
    
    const { data, error } = await supabase
      .from('inventory')
      .insert(newItem)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding skin to inventory:", error);
      return null;
    }
    
    return mapSupabaseToInventoryItem(data);
  } catch (error) {
    console.error("Error adding skin to inventory:", error);
    return null;
  }
};

/**
 * Updates an existing inventory item
 */
export const updateInventoryItem = async (item: InventoryItem): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }
    
    if (!item || !item.inventoryId) {
      console.error("Invalid inventory item data:", item);
      return false;
    }
    
    const { error } = await supabase
      .from('inventory')
      .update({
        name: item.name,
        weapon: item.weapon,
        wear: item.wear,
        rarity: item.rarity,
        image: item.image,
        current_price: item.currentPrice,
        purchase_price: item.purchasePrice,
        marketplace: item.marketplace,
        fee_percentage: item.feePercentage,
        is_stat_trak: item.isStatTrak,
        trade_lock_days: item.tradeLockDays,
        trade_lock_until: item.tradeLockUntil,
        float_value: item.floatValue,
        notes: item.notes,
        updated_at: new Date().toISOString(),
        currency_code: item.currency || 'USD',
      })
      .eq('inventory_id', item.inventoryId)
      .eq('user_id', session.user.id);
    
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

/**
 * Removes a skin from the user's inventory
 */
export const removeSkinFromInventory = async (inventoryId: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .update({ is_in_user_inventory: false })
      .eq('inventory_id', inventoryId)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error("Error removing skin from inventory:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error removing skin from inventory:", error);
    return false;
  }
};

/**
 * Sells a skin and records the transaction
 */
export const sellSkin = async (itemId: string, sellData: SellData): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }
    
    // First, get the item details
    const { data: itemData, error: itemError } = await supabase
      .from('inventory')
      .select('*')
      .eq('inventory_id', itemId)
      .eq('user_id', session.user.id)
      .single();
    
    if (itemError || !itemData) {
      console.error("Error retrieving item for sale:", itemError);
      return false;
    }
    
    // Create a transaction record
    const transactionId = uuidv4();
    const transaction = {
      transaction_id: transactionId,
      user_id: session.user.id,
      type: 'sell',
      item_id: itemId,
      weapon_name: itemData.weapon || 'Unknown',
      skin_name: itemData.name || 'Unknown',
      date: sellData.date || new Date().toISOString(),
      price: sellData.price,
      notes: sellData.notes || `Sold on ${sellData.marketplace}`,
      currency_code: sellData.currency || 'USD'
    };
    
    console.log("Creating sale transaction:", transaction);
    
    // Start a transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transaction);
    
    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return false;
    }
    
    // Mark the item as sold (no longer in inventory)
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        is_in_user_inventory: false,
        updated_at: new Date().toISOString()
      })
      .eq('inventory_id', itemId)
      .eq('user_id', session.user.id);
    
    if (updateError) {
      console.error("Error updating inventory after sale:", updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error selling skin:", error);
    return false;
  }
};
