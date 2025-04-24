
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
    
    return data.reduce((total, item) => {
      return total + (item.current_price || 0);
    }, 0);
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
