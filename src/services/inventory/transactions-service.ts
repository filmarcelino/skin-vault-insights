
import { Transaction } from "@/types/skin";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToTransaction } from "./inventory-mapper";

// Get all transactions for a user
export const getUserTransactions = async (userId?: string): Promise<Transaction[]> => {
  try {
    // Get the current user if userId isn't provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      
      if (!userId) {
        console.error("getUserTransactions: No user authenticated and no userId provided");
        return [];
      }
    }

    // Get all transactions for this user
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }

    // Return empty array if no transactions
    if (!data || data.length === 0) {
      return [];
    }

    // Convert from database schema to frontend model
    const transactions = data.map(item => {
      return {
        id: item.id,
        type: item.type as "add" | "sell" | "trade" | "buy",
        itemId: item.item_id,
        skinName: item.skin_name || "",
        weaponName: item.weapon_name || "",
        price: item.price || 0,
        date: item.date,
        userId: item.user_id,
        currency: item.currency_code || "USD",
        // Add marketplace with proper fallback
        marketplace: item.marketplace || "Unknown", // Using field from database
        notes: item.notes || ""
      };
    });

    return transactions;
  } catch (error) {
    console.error("Exception in getUserTransactions:", error);
    return [];
  }
};

// Get a transaction by ID
export const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (error || !data) {
      console.error("Error fetching transaction:", error);
      return null;
    }

    // Map database fields to our frontend model
    return {
      id: data.id,
      type: data.type as "add" | "sell" | "trade" | "buy",
      itemId: data.item_id,
      skinName: data.skin_name || "",
      weaponName: data.weapon_name || "",
      price: data.price || 0,
      date: data.date,
      userId: data.user_id,
      currency: data.currency_code || "USD",
      marketplace: data.marketplace || "Unknown", // Using field from database
      notes: data.notes || ""
    };
  } catch (error) {
    console.error("Exception in getTransactionById:", error);
    return null;
  }
};

// Add transaction
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
        currency_code: transaction.currency || "USD",
        marketplace: transaction.marketplace || "Unknown"
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
