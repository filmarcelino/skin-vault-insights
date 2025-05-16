
import { supabase } from "@/integrations/supabase/client";
import { Skin } from "@/types/skin";
import { v4 as uuidv4 } from "uuid";
import { addTransaction } from "./transactions-service";
import { getCurrentDateAsString } from "./inventory-fetch-service";

// Add a skin to the user's inventory - update for consistent parameter object
export const addSkinToInventory = async ({
  userId,
  skin,
  options = {}
}: {
  userId: string,
  skin: Skin,
  options?: {
    purchasePrice?: number;
    marketplace?: string;
    feePercentage?: number;
    notes?: string;
    acquiredDate?: string;
    isStatTrak?: boolean;
    floatValue?: number;
    wear?: string;
  }
}): Promise<{ success: boolean; inventoryId?: string; error?: any }> => {
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
      collection_name: typeof skin.collections === 'string' ? 
        skin.collections : 
        Array.isArray(skin.collections) && skin.collections.length > 0 ? 
          (skin.collections[0]?.name || null) : null,
    };

    // Insert the item into inventory
    const { error: inventoryError } = await supabase
      .from("inventory")
      .insert(inventoryData);

    if (inventoryError) {
      console.error("Error adding skin to inventory:", inventoryError);
      return { success: false, error: inventoryError };
    }

    // Create a transaction record with marketplace
    await addTransaction({
      id: uuidv4(),
      type: "add",
      itemId: inventoryId,
      skinName: skin.name,
      weaponName: skin.weapon || "",
      price: options.purchasePrice || skin.price || 0,
      date: options.acquiredDate || now,
      userId,
      currency: "USD",
      marketplace: options.marketplace || "Steam Market",
      notes: options.notes || ""
    });

    return { success: true, inventoryId };
  } catch (error) {
    console.error("Exception in addSkinToInventory:", error);
    return { success: false, error };
  }
};
