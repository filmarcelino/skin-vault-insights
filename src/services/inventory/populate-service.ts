
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Function to manually populate a user's inventory with starter skins
 * This can be used for existing users who don't have an inventory yet
 */
export const populateUserInventory = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to populate your inventory");
      return false;
    }
    
    const { data, error } = await supabase.functions.invoke('populate-inventory', {
      body: { userId: user.id }
    });
    
    if (error) {
      console.error("Error populating inventory:", error);
      toast.error("Failed to populate inventory", {
        description: "An error occurred while adding starter skins to your inventory."
      });
      return false;
    }
    
    // Check if the inventory was already populated
    if (data.message === "User inventory already populated") {
      toast.info("Your inventory has already been populated", {
        description: "You already have starter skins in your inventory."
      });
      return true;
    }
    
    toast.success("Inventory populated successfully", {
      description: "70 starter skins have been added to your inventory!"
    });
    
    return true;
  } catch (error) {
    console.error("Error in populateUserInventory:", error);
    toast.error("Failed to populate inventory", {
      description: "An unexpected error occurred. Please try again."
    });
    return false;
  }
};

/**
 * Check if a user's inventory has already been populated
 */
export const isInventoryPopulated = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('inventory_populated')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error("Error checking inventory populated status:", error);
      return false;
    }
    
    return !!data?.inventory_populated;
  } catch (error) {
    console.error("Error in isInventoryPopulated:", error);
    return false;
  }
};
