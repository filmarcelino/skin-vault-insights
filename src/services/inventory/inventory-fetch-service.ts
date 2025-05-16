
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types/skin";
import { mapSupabaseToInventoryItem } from "./inventory-mapper";

// Helper to get the current date as ISO string
export const getCurrentDateAsString = (): string => {
  return new Date().toISOString();
};

// Fetch user's inventory
export const fetchUserInventory = async (userId: string): Promise<InventoryItem[]> => {
  if (!userId) {
    console.error("fetchUserInventory: No userId provided");
    return [];
  }

  try {
    console.log(`Fetching inventory for user: ${userId}`);
    
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("is_in_user_inventory", true)
      .order("acquired_date", { ascending: false });

    if (error) {
      console.error("Error fetching inventory:", error);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      console.log("No inventory data found or invalid data format");
      return [];
    }

    console.log(`Found ${data.length} items in inventory`);
    return data.map(item => {
      // Handle missing or default properties
      return mapSupabaseToInventoryItem({
        ...item,
        // Add defaults for any missing properties
        type: "Normal", // Add a default type property
        category: item.collection_name || "Normal" // Use collection_name as fallback for category
      });
    });
  } catch (error) {
    console.error("Exception in fetchUserInventory:", error);
    return [];
  }
};

// Fetch sold items
export const fetchSoldItems = async (userId?: string): Promise<InventoryItem[]> => {
  try {
    // Get the current user if userId isn't provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      
      if (!userId) {
        console.error("fetchSoldItems: No user authenticated and no userId provided");
        return [];
      }
    }

    console.log(`Fetching sold items for user: ${userId}`);
    
    const { data: soldData, error: soldError } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("is_in_user_inventory", false)
      .order("acquired_date", { ascending: false });

    if (soldError) {
      console.error("Error fetching sold items:", soldError);
      return [];
    }

    return soldData?.map(item => mapSupabaseToInventoryItem({
      ...item,
      // Add defaults for any missing properties
      type: "Normal", // Add a default type property
      category: item.collection_name || "Normal" // Use collection_name as fallback for category
    })) || [];
  } catch (error) {
    console.error("Exception in fetchSoldItems:", error);
    return [];
  }
};
