
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/skin";
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper to convert DB type string to Transaction type enum
 */
const mapTransactionType = (type: string): "add" | "sell" | "trade" | "buy" => {
  switch (type.toLowerCase()) {
    case "add": return "add";
    case "sell": return "sell";
    case "trade": return "trade";
    case "buy": return "buy";
    default: return "buy"; // Default to "buy" for any unexpected values
  }
};

/**
 * Fetches transactions for a user
 */
export const getUserTransactions = async (userId?: string): Promise<Transaction[]> => {
  try {
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No user session found");
        return [];
      }
      
      userId = session.user.id;
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
    
    return data.map(item => ({
      id: item.transaction_id,
      itemId: item.item_id,
      userId: item.user_id,
      skinName: item.skin_name,
      weaponName: item.weapon_name,
      date: item.date,
      price: item.price,
      type: mapTransactionType(item.type),
      notes: item.notes || "",
      currency: item.currency_code || "USD",
      marketplace: "Steam" // Default value since marketplace doesn't exist in DB schema
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

/**
 * Adds a new transaction
 */
export const addTransaction = async (transaction: Partial<Transaction>): Promise<Transaction | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No user session found");
      return null;
    }
    
    // Create a new transaction ID if not provided
    const transactionId = transaction.id || uuidv4();
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        user_id: session.user.id,
        item_id: transaction.itemId,
        skin_name: transaction.skinName,
        weapon_name: transaction.weaponName,
        date: transaction.date || new Date().toISOString(),
        price: transaction.price || 0,
        type: transaction.type || 'buy',
        notes: transaction.notes || '',
        currency_code: transaction.currency || 'USD'
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding transaction:", error);
      return null;
    }
    
    return {
      id: data.transaction_id,
      itemId: data.item_id,
      userId: data.user_id,
      skinName: data.skin_name,
      weaponName: data.weapon_name,
      date: data.date,
      price: data.price,
      type: mapTransactionType(data.type),
      notes: data.notes || "",
      currency: data.currency_code || "USD",
      marketplace: "Steam" // Default value
    };
  } catch (error) {
    console.error("Error adding transaction:", error);
    return null;
  }
};

/**
 * Gets a transaction by its ID
 */
export const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();
    
    if (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
    
    return {
      id: data.transaction_id,
      itemId: data.item_id,
      userId: data.user_id,
      skinName: data.skin_name,
      weaponName: data.weapon_name,
      date: data.date,
      price: data.price,
      type: mapTransactionType(data.type),
      notes: data.notes || "",
      currency: data.currency_code || "USD",
      marketplace: "Steam" // Default value
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
};
