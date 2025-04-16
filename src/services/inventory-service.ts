
import { InventoryItem, Skin, Transaction } from "@/types/skin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Helper function to convert Supabase inventory items to our app's model
const mapSupabaseToInventoryItem = (item: any): InventoryItem => {
  return {
    id: item.skin_id,
    inventoryId: item.inventory_id,
    name: item.name,
    weapon: item.weapon,
    rarity: item.rarity,
    wear: item.wear,
    image: item.image,
    price: item.price,
    purchasePrice: item.purchase_price,
    currentPrice: item.current_price,
    acquiredDate: item.acquired_date,
    isStatTrak: item.is_stat_trak,
    tradeLockDays: item.trade_lock_days,
    tradeLockUntil: item.trade_lock_until,
    marketplace: item.marketplace,
    feePercentage: item.fee_percentage,
    floatValue: item.float_value,
    notes: item.notes,
    collection: item.collection_name ? {
      id: item.collection_id,
      name: item.collection_name
    } : undefined,
    isInUserInventory: true
  };
};

// Helper function to convert Supabase transactions to our app's model
const mapSupabaseToTransaction = (transaction: any): Transaction => {
  return {
    id: transaction.transaction_id,
    type: transaction.type,
    itemId: transaction.item_id,
    weaponName: transaction.weapon_name,
    skinName: transaction.skin_name,
    date: transaction.date,
    price: transaction.price,
    notes: transaction.notes
  };
};

// Recuperar o inventário do usuário do Supabase
export const getUserInventory = async (): Promise<InventoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error getting inventory from Supabase:", error);
      return [];
    }
    
    console.log("Retrieved inventory:", data);
    return Array.isArray(data) ? data.map(mapSupabaseToInventoryItem) : [];
  } catch (error) {
    console.error("Error getting inventory:", error);
    return [];
  }
};

// Salvar uma skin no inventário do usuário
export const addSkinToInventory = async (skin: Skin, purchaseInfo: {
  purchasePrice: number;
  marketplace: string;
  feePercentage?: number;
  notes?: string;
}): Promise<InventoryItem | null> => {
  try {
    // Generate a random ID for the inventory item if one doesn't exist
    const inventoryId = `inv-${Date.now()}-${skin.id || Math.random().toString(36).substring(2, 15)}`;
    const tradeLockDays = Math.floor(Math.random() * 8); // Random trade lock for demo
    const tradeLockUntil = new Date(new Date().getTime() + tradeLockDays * 24 * 60 * 60 * 1000).toISOString();
    
    console.log("Adding skin to inventory with data:", {
      skin_id: skin.id,
      inventory_id: inventoryId,
      name: skin.name,
      weapon: skin.weapon,
      other_details: "..."
    });
    
    // Inserir no Supabase
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        skin_id: skin.id || `skin-${Date.now()}`,
        inventory_id: inventoryId,
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
        acquired_date: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding skin to inventory:", error);
      return null;
    }
    
    // Adicionar transação
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
    
    console.log("Added skin to inventory:", data);
    
    return data ? mapSupabaseToInventoryItem(data) : null;
  } catch (error) {
    console.error("Error adding skin to inventory:", error);
    return null;
  }
};

// Remover uma skin do inventário do usuário
export const removeSkinFromInventory = async (inventoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('inventory_id', inventoryId);
    
    if (error) {
      console.error("Error removing skin from inventory:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error removing skin:", error);
    return false;
  }
};

// Atualizar uma skin no inventário do usuário
export const updateInventoryItem = async (updatedItem: InventoryItem): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .update({
        current_price: updatedItem.currentPrice,
        notes: updatedItem.notes,
        float_value: updatedItem.floatValue,
        is_stat_trak: updatedItem.isStatTrak
      })
      .eq('inventory_id', updatedItem.inventoryId);
    
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

// Obter todas as transações do usuário
export const getUserTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
    
    return Array.isArray(data) ? data.map(mapSupabaseToTransaction) : [];
  } catch (error) {
    console.error("Error getting transactions:", error);
    return [];
  }
};

// Adicionar uma nova transação
export const addTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    console.log("Adding transaction:", transaction);
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transaction.id,
        type: transaction.type,
        item_id: transaction.itemId,
        weapon_name: transaction.weaponName,
        skin_name: transaction.skinName,
        date: transaction.date,
        price: typeof transaction.price === 'string' ? parseFloat(transaction.price) : transaction.price,
        notes: transaction.notes
      });
    
    if (error) {
      console.error("Error adding transaction:", error);
      return false;
    }
    
    console.log("Added transaction successfully");
    return true;
  } catch (error) {
    console.error("Error adding transaction:", error);
    return false;
  }
};

// Vender uma skin e registrar a transação
export const sellSkin = async (inventoryId: string, sellData: {
  soldPrice: number;
  soldMarketplace: string;
  soldFeePercentage: number;
  soldNotes?: string;
}): Promise<boolean> => {
  try {
    // Obter informações da skin
    const { data: skin, error: skinError } = await supabase
      .from('inventory')
      .select('weapon, name')
      .eq('inventory_id', inventoryId)
      .single();
    
    if (skinError) {
      console.error("Error getting skin info:", skinError);
      return false;
    }
    
    // Remover do inventário
    const { error: removeError } = await supabase
      .from('inventory')
      .delete()
      .eq('inventory_id', inventoryId);
    
    if (removeError) {
      console.error("Error removing skin:", removeError);
      return false;
    }
    
    // Adicionar transação
    const transactionSuccess = await addTransaction({
      id: `trans-${Date.now()}`,
      type: 'sell',
      itemId: inventoryId,
      weaponName: skin?.weapon || "Unknown",
      skinName: skin?.name || "Unknown Skin",
      date: new Date().toLocaleDateString(),
      price: sellData.soldPrice,
      notes: sellData.soldNotes
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

// Calcular o valor total do inventário
export const calculateInventoryValue = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('current_price');
    
    if (error) {
      console.error("Error calculating inventory value:", error);
      return 0;
    }
    
    return data.reduce((total, item) => {
      return total + (item.current_price || 0);
    }, 0);
  } catch (error) {
    console.error("Error calculating inventory value:", error);
    return 0;
  }
};

// Encontrar a skin mais valiosa no inventário
export const findMostValuableSkin = async (): Promise<InventoryItem | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('current_price', { ascending: false })
      .limit(1);
    
    if (error || !data.length) {
      console.error("Error finding most valuable skin:", error);
      return null;
    }
    
    return mapSupabaseToInventoryItem(data[0]);
  } catch (error) {
    console.error("Error finding most valuable skin:", error);
    return null;
  }
};
