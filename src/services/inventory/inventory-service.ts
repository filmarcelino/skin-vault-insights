import { Skin, InventoryItem, SellData } from "@/types/skin";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToInventoryItem } from "./inventory-mapper";
import { addTransaction } from "./transactions-service";
import { safeBoolean, safeString } from "@/utils/safe-type-utils";

// Helper function to safely get properties from potentially null objects
const getSkinProperty = <T>(data: any | null, property: string, defaultValue: T): T => {
  if (!data || typeof data !== 'object' || !(property in data)) {
    return defaultValue;
  }
  const value = data[property as keyof typeof data];
  return (value === null || value === undefined) ? defaultValue : value as T;
};

export const removeSkinFromInventory = async (inventoryId: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }
    
    // Fetch skin data before removal to include in transaction
    const { data: skinData, error: skinError } = await supabase
      .from('inventory')
      .select('weapon, name, currency_code')
      .eq('inventory_id', inventoryId)
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (skinError) {
      console.error("Error fetching skin data:", skinError);
      return false;
    }
    
    const weaponName = getSkinProperty(skinData, 'weapon', "Unknown");
    const skinName = getSkinProperty(skinData, 'name', "Unknown Skin");
    const currencyCode = getSkinProperty(skinData, 'currency_code', "USD");
    
    const { error: deleteError } = await supabase
      .from('inventory')
      .delete()
      .eq('inventory_id', inventoryId)
      .eq('user_id', session.user.id);
    
    if (deleteError) {
      console.error("Error removing skin from inventory:", deleteError);
      return false;
    }
    
    await addTransaction({
      id: `trans-${Date.now()}`,
      type: 'remove',
      itemId: inventoryId,
      weaponName: weaponName,
      skinName: skinName,
      date: new Date().toISOString(),
      price: 0,
      notes: "Skin removed from inventory",
      currency: currencyCode
    });
    
    return true;
  } catch (error) {
    console.error("Error removing skin:", error);
    return false;
  }
};

export const getUserInventory = async (): Promise<InventoryItem[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return [];
    }
    
    console.log("Fetching inventory for user:", session.user.id);
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error getting inventory from Supabase:", error);
      return [];
    }
    
    console.log("Retrieved inventory data:", data);
    
    // Map the data to InventoryItem objects and ensure isInUserInventory is set correctly
    const mappedItems = Array.isArray(data) ? data.map(item => {
      try {
        // Check if is_in_user_inventory exists and explicitly set it
        if ('is_in_user_inventory' in item) {
          console.log(`Item ${item.name || 'unknown'} has is_in_user_inventory:`, item.is_in_user_inventory);
        } else {
          console.log(`Item ${item.name || 'unknown'} missing is_in_user_inventory field`);
          // If missing, we'll set a default in mapSupabaseToInventoryItem
        }
        
        const mappedItem = mapSupabaseToInventoryItem(item);
        
        // Double-check that isInUserInventory is set correctly after mapping
        if (mappedItem) {
          // Convert any value to a boolean to avoid type issues
          mappedItem.isInUserInventory = safeBoolean(item.is_in_user_inventory !== false);
          console.log(`Item ${mappedItem.name || 'unknown'} isInUserInventory set to:`, mappedItem.isInUserInventory);
        }
        return mappedItem;
      } catch (err) {
        console.error("Error mapping inventory item:", err);
        return null;
      }
    }).filter(Boolean) as InventoryItem[] : [];
    
    console.log("Final mapped items:", mappedItems);
    return mappedItems;
  } catch (error) {
    console.error("Error getting inventory:", error);
    return [];
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
    
    const skinName = 'name' in skin && typeof skin.name === 'string' ? skin.name : "";
      
    if (!skinName) {
      console.error("Invalid skin data: name property is missing or invalid", skin);
      return null;
    }
    
    const skinId = skin.id || `skin-${Date.now()}`;
    const inventoryId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const tradeLockDays = Math.floor(Math.random() * 8);
    const tradeLockUntil = new Date(new Date().getTime() + tradeLockDays * 24 * 60 * 60 * 1000).toISOString();
    
    const insertData = {
      skin_id: skinId,
      inventory_id: inventoryId,
      user_id: session.user.id,
      weapon: skin.weapon || "Unknown",
      name: skinName,
      wear: skin.wear,
      rarity: skin.rarity,
      image: skin.image,
      price: skin.price || 0,
      current_price: skin.price || purchaseInfo.purchasePrice || 0,
      purchase_price: purchaseInfo.purchasePrice || 0,
      marketplace: purchaseInfo.marketplace || "Steam Market",
      fee_percentage: purchaseInfo.feePercentage || 0,
      notes: purchaseInfo.notes || "",
      is_stat_trak: skin.isStatTrak || false,
      trade_lock_days: tradeLockDays,
      trade_lock_until: tradeLockUntil,
      collection_id: skin.collection?.id,
      collection_name: skin.collection?.name,
      float_value: skin.floatValue || 0,
      acquired_date: new Date().toISOString(),
      currency_code: purchaseInfo.currency || "USD",
      is_in_user_inventory: true // Explicitly set this to true for new items
    };
    
    const { data, error } = await supabase
      .from('inventory')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding skin to inventory:", error);
      return null;
    }
    
    const transactionSuccess = await addTransaction({
      id: `trans-${Date.now()}`,
      type: 'add',
      itemId: inventoryId,
      weaponName: skin.weapon || "Unknown",
      skinName: skinName,
      date: new Date().toISOString(),
      price: purchaseInfo.purchasePrice || 0,
      notes: purchaseInfo.notes || "",
      currency: purchaseInfo.currency || "USD"
    });
    
    if (!transactionSuccess) {
      console.warn("Failed to record transaction for added skin");
    }
    
    const mappedItem = mapSupabaseToInventoryItem(data);
    if (mappedItem) {
      // Ensure isInUserInventory is set correctly
      mappedItem.isInUserInventory = true;
    }
    
    return mappedItem;
  } catch (error) {
    console.error("Error adding skin to inventory:", error);
    return null;
  }
};

export const updateInventoryItem = async (updatedItem: InventoryItem): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }
    
    const { error } = await supabase
      .from('inventory')
      .update({
        current_price: updatedItem.currentPrice,
        notes: updatedItem.notes,
        float_value: updatedItem.floatValue,
        is_stat_trak: updatedItem.isStatTrak
      })
      .eq('inventory_id', updatedItem.inventoryId)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error("Error updating inventory item:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating item:", error);
    return false;
  }
};

export const sellSkin = async (inventoryId: string, sellData: SellData): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }

    const { data: skinData, error: skinError } = await supabase
      .from('inventory')
      .select('weapon, name, currency_code')
      .eq('inventory_id', inventoryId)
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    const weaponName = getSkinProperty(skinData, 'weapon', "Unknown");
    const skinName = getSkinProperty(skinData, 'name', "Unknown Skin");
    const originalCurrency = getSkinProperty(skinData, 'currency_code', "USD");
    
    if (skinError) {
      console.error("Error getting skin info:", skinError);
    }
    
    const { error: removeError } = await supabase
      .from('inventory')
      .delete()
      .eq('inventory_id', inventoryId)
      .eq('user_id', session.user.id);
    
    if (removeError) {
      console.error("Error removing skin:", removeError);
      return false;
    }
    
    const transactionSuccess = await addTransaction({
      id: `trans-${Date.now()}`,
      type: 'sell',
      itemId: inventoryId,
      weaponName: weaponName,
      skinName: skinName,
      date: sellData.soldDate || new Date().toISOString(),
      price: sellData.soldPrice,
      notes: `${sellData.soldNotes || ""} (${sellData.soldCurrency || "USD"})`,
      currency: sellData.soldCurrency || originalCurrency
    });
    
    if (!transactionSuccess) {
      console.error("Failed to record sell transaction");
      return false;
    }
    
    console.log("Sold skin successfully");
    return true;
  } catch (error) {
    console.error("Error selling skin:", error);
    return false;
  }
};
