
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types/skin";
import { mapSupabaseToInventoryItem } from "./inventory-mapper";

export const calculateInventoryValue = async (): Promise<number> => {
  try {
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
    
    const total = data.reduce((total, item) => {
      return total + (item.current_price || 0);
    }, 0);
    
    // Return the value with 2 decimal places
    return parseFloat(total.toFixed(2));
  } catch (error) {
    console.error("Error calculating inventory value:", error);
    return 0;
  }
};

export const findMostValuableSkin = async (): Promise<InventoryItem | null> => {
  try {
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
    
    if (error) {
      console.error("Error finding most valuable skin:", error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error("No skins found in inventory");
      return null;
    }
    
    return mapSupabaseToInventoryItem(data[0]);
  } catch (error) {
    console.error("Error finding most valuable skin:", error);
    return null;
  }
};

// Add this simple function for inventory stats
export const calculateInventoryStats = (items: any[]) => {
  if (!Array.isArray(items)) return { totalItems: 0, totalValue: 0, averageValue: 0 };
  
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.price || item.purchasePrice || 0), 0);
  const averageValue = totalItems > 0 ? totalValue / totalItems : 0;
  
  return {
    totalItems,
    totalValue,
    averageValue
  };
};
