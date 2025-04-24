
import { Skin, InventoryItem, SellData } from "@/types/skin";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToInventoryItem } from "./inventory-mapper";
import { addTransaction } from "./transactions-service";

export const removeSkinFromInventory = async (inventoryId: string): Promise<boolean> => {
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
    
    if (skinError) {
      console.error("Error fetching skin data:", skinError);
      return false;
    }
    
    // Default values if no data is found
    const weaponName = skinData ? skinData.weapon || "Unknown" : "Unknown";
    const skinName = skinData ? skinData.name || "Unknown Skin" : "Unknown Skin";
    const currencyCode = skinData ? skinData.currency_code || "USD" : "USD";
    
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
      notes: "Skin removed from inventory"
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
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error getting inventory from Supabase:", error);
      return [];
    }
    
    return Array.isArray(data) ? data.map(mapSupabaseToInventoryItem).filter(Boolean) : [];
  } catch (error) {
    console.error("Error getting inventory:", error);
    return [];
  }
};

export const addSkinToInventory = async (skin: Skin, purchaseInfo: {
  purchasePrice: number;
  marketplace: string;
  feePercentage?: number;
  notes?: string;
  currency?: string;
}): Promise<InventoryItem | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return null;
    }
    
    if (!skin || !skin.name) {
      console.error("Invalid skin data:", skin);
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
      name: skin.name,
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
      currency_code: purchaseInfo.currency || "USD"
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
    
    await addTransaction({
      id: `trans-${Date.now()}`,
      type: 'add',
      itemId: inventoryId,
      weaponName: skin.weapon || "Unknown",
      skinName: skin.name,
      date: new Date().toISOString(),
      price: purchaseInfo.purchasePrice || 0,
      notes: purchaseInfo.notes || ""
    });
    
    return mapSupabaseToInventoryItem(data);
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

    // Default values in case we don't have skin data
    let weaponName = "Unknown";
    let skinName = "Unknown Skin";
    let originalCurrency = "USD";

    // If we have valid data, use it
    if (skinData) {
      weaponName = skinData.weapon || weaponName;
      skinName = skinData.name || skinName;
      originalCurrency = skinData.currency_code || originalCurrency;
    } else if (skinError) {
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
