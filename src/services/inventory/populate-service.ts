
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
      toast.error("Você precisa estar logado para popular seu inventário");
      return false;
    }
    
    // Get user email to check if it's the test account
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();
    
    if (!profileData || profileData.email !== "teste@teste.com") {
      toast.error("Esta funcionalidade está disponível apenas para contas de teste");
      return false;
    }
    
    const { data, error } = await supabase.functions.invoke('populate-inventory', {
      body: { userId: user.id }
    });
    
    if (error) {
      console.error("Erro ao popular inventário:", error);
      toast.error("Falha ao popular o inventário", {
        description: "Ocorreu um erro ao adicionar skins iniciais ao seu inventário."
      });
      return false;
    }
    
    // Check if the inventory was already populated
    if (data.message === "User inventory already populated") {
      toast.info("Seu inventário já foi populado", {
        description: "Você já tem skins iniciais em seu inventário."
      });
      return true;
    }
    
    toast.success("Inventário populado com sucesso", {
      description: "Suas skins iniciais foram adicionadas ao seu inventário!"
    });
    
    return true;
  } catch (error) {
    console.error("Erro em populateUserInventory:", error);
    toast.error("Falha ao popular inventário", {
      description: "Ocorreu um erro inesperado. Por favor, tente novamente."
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
      .maybeSingle(); // Changed from single() to maybeSingle() to handle case when profile doesn't exist
    
    if (error) {
      console.error("Erro ao verificar status de inventário populado:", error);
      return false;
    }
    
    return !!data?.inventory_populated;
  } catch (error) {
    console.error("Erro em isInventoryPopulated:", error);
    return false;
  }
};
