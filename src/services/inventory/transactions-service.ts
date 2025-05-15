
import { Transaction } from "@/types/skin";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToTransaction } from "./inventory-mapper";

// This is the function we need to export for the useTransactions hook
export const getUserTransactions = async (): Promise<Transaction[]> => {
  try {
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
    
    return Array.isArray(data) ? data.map(mapSupabaseToTransaction).filter(Boolean) : [];
  } catch (error) {
    console.error("Error getting transactions:", error);
    return [];
  }
};

export const addTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
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
        currency_code: transaction.currency || "USD"
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

// Adding an alias for backward compatibility
export const fetchTransactions = getUserTransactions;
