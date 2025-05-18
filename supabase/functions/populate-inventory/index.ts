
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

import { starterSkins, generateStarterItem } from "../../utils/starter-inventory.ts";

// Set up CORS headers for browser support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  return null;
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    const { userId } = await req.json();
    
    if (!userId || typeof userId !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing or invalid userId parameter" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Check if user inventory is already populated
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('inventory_populated')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error("Error checking profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to check user profile", details: profileError }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // If inventory is already populated, don't do it again
    if (profile && profile.inventory_populated) {
      return new Response(
        JSON.stringify({ success: true, message: "User inventory already populated" }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Generate 70 starter inventory items
    const inventoryItems = starterSkins.map(skin => {
      const item = generateStarterItem(
        skin.id,
        skin.name,
        skin.weapon, 
        skin.image,
        skin.rarity,
        skin.price,
        skin.minFloat || 0,
        skin.maxFloat || 1,
        userId
      );
      
      // Convert to database format
      return {
        inventory_id: item.inventoryId,
        name: item.name,
        weapon: item.weapon,
        image: item.image,
        rarity: item.rarity,
        price: item.price,
        purchase_price: item.purchasePrice,
        current_price: item.price,
        acquired_date: item.acquiredDate,
        is_stat_trak: item.isStatTrak,
        float_value: item.floatValue,
        wear: item.wear,
        marketplace: item.marketplace,
        fee_percentage: item.fee_percentage,
        is_in_user_inventory: true,
        skin_id: item.skin_id,
        user_id: userId,
        currency_code: "USD",
        notes: ""
      };
    });
    
    // Split into chunks of 10 for batch insertion to avoid payload size limits
    const chunks = [];
    for (let i = 0; i < inventoryItems.length; i += 10) {
      chunks.push(inventoryItems.slice(i, i + 10));
    }
    
    // Insert all items in chunks
    for (const chunk of chunks) {
      const { error: insertError } = await supabaseClient
        .from('inventory')
        .insert(chunk);
      
      if (insertError) {
        console.error("Error populating inventory chunk:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to populate inventory", details: insertError }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json" 
            } 
          }
        );
      }
    }
    
    // Mark profile as having inventory populated
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ inventory_populated: true })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update user profile", details: updateError }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully populated inventory with ${inventoryItems.length} skins` 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
    
  } catch (error) {
    console.error("Unhandled error:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
