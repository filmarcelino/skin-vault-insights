
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/format-utils";
import { nanoid } from "nanoid";
import { InventoryItem, SellData } from "@/types/skin";

export async function addInventoryItem(item: InventoryItem) {
  const user = supabase.auth.getUser();
  const inventoryId = nanoid();

  try {
    // Prepare inventory item data
    const inventoryData = {
      inventory_id: inventoryId,
      skin_id: item.id,
      name: item.name,
      weapon: item.weapon,
      rarity: item.rarity,
      image: item.image,
      purchase_price: item.purchasePrice || 0,
      acquired_date: item.acquiredDate || new Date().toISOString(),
      user_id: (await user).data.user?.id,
      is_in_user_inventory: true,
      trade_lock_days: item.tradeLockDays || 0,
      trade_lock_until: item.tradeLockUntil,
      float_value: item.floatValue,
      is_stat_trak: item.isStatTrak || false,
      wear: item.wear,
      notes: item.notes,
      marketplace: item.marketplace,
      fee_percentage: item.feePercentage
    };

    // Add item to inventory
    const { data: addedItem, error } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Record transaction
    await recordTransaction({
      type: 'add',
      itemId: inventoryId,
      skinName: item.name,
      weaponName: item.weapon,
      price: item.purchasePrice || 0
    });

    return { data: addedItem, error: null };

  } catch (error) {
    console.error("Error adding inventory item:", error);
    return { data: null, error };
  }
}

export async function fetchSoldItems() {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error("User not authenticated");
    }

    // Get transactions of type 'sell'
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('type', 'sell');

    if (transactionError) {
      throw transactionError;
    }

    // Map transactions to the expected format
    const soldItems = transactions.map((transaction) => {
      return {
        id: transaction.item_id,
        inventoryId: transaction.item_id,
        name: transaction.skin_name,
        weapon: transaction.weapon_name,
        image: "", // This would need to be stored in the transaction or looked up
        rarity: "Unknown", // This would need to be stored in the transaction or looked up
        price: transaction.price || 0,
        soldPrice: transaction.price || 0,
        soldDate: transaction.date,
        soldMarketplace: transaction.marketplace || "Unknown",
        isInUserInventory: false
      };
    });

    return soldItems;
  } catch (error) {
    console.error("Error fetching sold items:", error);
    return [];
  }
}

interface TransactionParams {
  type: 'add' | 'sell' | 'trade' | 'buy';
  itemId: string;
  skinName: string;
  weaponName: string;
  price: number;
  marketplace?: string;
  notes?: string;
}

export async function recordTransaction({
  type,
  itemId,
  skinName,
  weaponName,
  price,
  marketplace,
  notes
}: TransactionParams) {
  try {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      throw new Error("User not authenticated");
    }
    
    const transactionId = nanoid();
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        type,
        item_id: itemId,
        user_id: user.data.user.id,
        price,
        date: new Date().toISOString(),
        skin_name: skinName,
        weapon_name: weaponName,
        notes,
        marketplace
      });
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error recording transaction:", error);
    return { data: null, error };
  }
}

export async function markItemAsSold(
  itemId: string, 
  sellData: SellData
) {
  try {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      throw new Error("User not authenticated");
    }
    
    // Get item details before marking as sold
    const { data: item, error: itemError } = await supabase
      .from('inventory')
      .select('*')
      .eq('inventory_id', itemId)
      .eq('user_id', user.data.user.id)
      .single();
      
    if (itemError || !item) {
      throw new Error("Item not found");
    }
    
    // Update inventory item to mark as sold
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ is_in_user_inventory: false })
      .eq('inventory_id', itemId)
      .eq('user_id', user.data.user.id);
      
    if (updateError) {
      throw updateError;
    }
    
    // Record sale transaction
    const profit = sellData.soldPrice - (item.purchase_price || 0);
    
    await recordTransaction({
      type: 'sell',
      itemId,
      skinName: item.name,
      weaponName: item.weapon,
      price: sellData.soldPrice,
      marketplace: sellData.soldMarketplace,
      notes: sellData.soldNotes
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error marking item as sold:", error);
    return { success: false, error };
  }
}
