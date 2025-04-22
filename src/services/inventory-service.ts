import { InventoryItem, Skin, Transaction } from "@/types/skin";
import { supabase } from "@/integrations/supabase/client";

// Helper function to convert Supabase inventory items to our app's model
const mapSupabaseToInventoryItem = (item: any): InventoryItem => {
  if (!item) return null;
  
  return {
    id: item.skin_id || '',
    inventoryId: item.inventory_id || '',
    name: item.name || '',
    weapon: item.weapon || '',
    rarity: item.rarity,
    wear: item.wear,
    image: item.image,
    price: item.price,
    purchasePrice: item.purchase_price,
    currentPrice: item.current_price,
    acquiredDate: item.acquired_date || new Date().toISOString(),
    isStatTrak: item.is_stat_trak || false,
    tradeLockDays: item.trade_lock_days,
    tradeLockUntil: item.trade_lock_until,
    marketplace: item.marketplace,
    feePercentage: item.fee_percentage,
    floatValue: item.float_value,
    notes: item.notes,
    currency: item.currency_code || "USD", // Garantir que temos a moeda da compra
    collection: item.collection_name ? {
      id: item.collection_id,
      name: item.collection_name
    } : undefined,
    isInUserInventory: true
  };
};

// Helper function to convert Supabase transactions to our app's model
const mapSupabaseToTransaction = (transaction: any): Transaction => {
  if (!transaction) return null;
  
  return {
    id: transaction.transaction_id || '',
    type: transaction.type || 'add',
    itemId: transaction.item_id || '',
    weaponName: transaction.weapon_name || '',
    skinName: transaction.skin_name || '',
    date: transaction.date || new Date().toISOString(),
    price: transaction.price,
    notes: transaction.notes,
    currency: transaction.currency_code || "USD" // Adicionando moeda à transação
  };
};

// Remover uma skin do inventário do usuário
export const removeSkinFromInventory = async (inventoryId: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }
    
    // Buscar informações da skin antes de removê-la
    const { data: skinData, error: skinError } = await supabase
      .from('inventory')
      .select('weapon, name')
      .eq('inventory_id', inventoryId)
      .eq('user_id', session.user.id)
      .single();
    
    // Se não conseguirmos buscar os dados da skin, ainda podemos tentar remover
    const weaponName = skinData && 'weapon' in skinData ? skinData.weapon : "Unknown";
    const skinName = skinData && 'name' in skinData ? skinData.name : "Unknown Skin";
    
    // Hard delete the skin from inventory
    const { error: deleteError } = await supabase
      .from('inventory')
      .delete()
      .eq('inventory_id', inventoryId)
      .eq('user_id', session.user.id);
    
    if (deleteError) {
      console.error("Error removing skin from inventory:", deleteError);
      return false;
    }
    
    // Add a transaction record for the removal
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

// Recuperar o inventário do usuário atual do Supabase
export const getUserInventory = async (): Promise<InventoryItem[]> => {
  try {
    // Get current user session
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

// Salvar uma skin no inventário do usuário
export const addSkinToInventory = async (skin: Skin, purchaseInfo: {
  purchasePrice: number;
  marketplace: string;
  feePercentage?: number;
  notes?: string;
  currency?: string; // Adicionado campo de moeda
}): Promise<InventoryItem | null> => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return null;
    }
    
    if (!skin || !skin.name) {
      console.error("Invalid skin data:", skin);
      return null;
    }
    
    // Generate a random ID for the inventory item if one doesn't exist
    const skinId = skin.id || `skin-${Date.now()}`;
    const inventoryId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const tradeLockDays = Math.floor(Math.random() * 8); // Random trade lock for demo
    const tradeLockUntil = new Date(new Date().getTime() + tradeLockDays * 24 * 60 * 60 * 1000).toISOString();
    
    console.log("Adding skin to inventory with data:", {
      skin_id: skinId,
      inventory_id: inventoryId,
      user_id: session.user.id,
      name: skin.name,
      weapon: skin.weapon,
      price: skin.price || purchaseInfo.purchasePrice || 0,
      currency_code: purchaseInfo.currency || "USD", // Armazenando a moeda usada
    });
    
    // Prepare data for insertion
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
      currency_code: purchaseInfo.currency || "USD" // Armazenando a moeda usada na compra
    };
    
    // Inserir no Supabase
    const { data, error } = await supabase
      .from('inventory')
      .insert(insertData)
      .select();
    
    if (error) {
      console.error("Error adding skin to inventory:", error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned after adding skin");
      return null;
    }
    
    console.log("Supabase insert response:", data);
    
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
    
    console.log("Added skin to inventory:", data[0]);
    
    return mapSupabaseToInventoryItem(data[0]);
  } catch (error) {
    console.error("Error adding skin to inventory:", error);
    return null;
  }
};

// Atualizar uma skin no inventário do usuário
export const updateInventoryItem = async (updatedItem: InventoryItem): Promise<boolean> => {
  try {
    // Get current user session
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

// Obter todas as transações do usuário
export const getUserTransactions = async (): Promise<Transaction[]> => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return [];
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
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
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }
    
    console.log("Adding transaction:", transaction);
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transaction.id,
        user_id: session.user.id,
        type: transaction.type,
        item_id: transaction.itemId,
        weapon_name: transaction.weaponName,
        skin_name: transaction.skinName,
        date: transaction.date,
        price: typeof transaction.price === 'string' ? parseFloat(transaction.price) : transaction.price,
        notes: transaction.notes,
        currency_code: transaction.currency || "USD" // Adicionando moeda à transação
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
  soldCurrency?: string;
}): Promise<boolean> => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return false;
    }

    // Obter informações da skin
    let { data: skinData, error: skinError } = await supabase
      .from('inventory')
      .select('weapon, name, currency_code')
      .eq('inventory_id', inventoryId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    let weaponName = "Unknown";
    let skinName = "Unknown Skin";
    let originalCurrency = "USD";

    if (skinError) {
      console.error("Error getting skin info:", skinError);
      if (
        skinError.message &&
        skinError.message.includes("column 'currency_code' does not exist")
      ) {
        // Tentativa alternativa de obter informações apenas com campos essenciais
        const { data: basicSkinData, error: basicSkinError } =
          await supabase
            .from("inventory")
            .select("weapon, name")
            .eq("inventory_id", inventoryId)
            .eq("user_id", session.user.id)
            .maybeSingle();

        if (basicSkinError) {
          console.error("Error getting basic skin info:", basicSkinError);
        } else if (basicSkinData && typeof basicSkinData === "object" && basicSkinData !== null) {
          weaponName = (basicSkinData as any).weapon ?? "Unknown";
          skinName = (basicSkinData as any).name ?? "Unknown Skin";
        }
      }
    } else if (skinData && typeof skinData === "object" && skinData !== null) {
      weaponName = (skinData as any).weapon ?? "Unknown";
      skinName = (skinData as any).name ?? "Unknown Skin";
      originalCurrency = (skinData as any).currency_code ?? "USD";
    }
    
    // Remover do inventário
    const { error: removeError } = await supabase
      .from('inventory')
      .delete()
      .eq('inventory_id', inventoryId)
      .eq('user_id', session.user.id);
    
    if (removeError) {
      console.error("Error removing skin:", removeError);
      return false;
    }
    
    // Adicionar transação
    const transactionSuccess = await addTransaction({
      id: `trans-${Date.now()}`,
      type: 'sell',
      itemId: inventoryId,
      weaponName: weaponName,
      skinName: skinName,
      date: new Date().toLocaleDateString(),
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

// Calcular o valor total do inventário
export const calculateInventoryValue = async (): Promise<number> => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return 0;
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .select('current_price')
      .eq('user_id', session.user.id);
    
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

// Encontrar a skin mais valiosa no inventário do usuário
export const findMostValuableSkin = async (): Promise<InventoryItem | null> => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return null;
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', session.user.id)
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
