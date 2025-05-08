
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stripeKey } = await req.json();
    
    // Validate the Stripe key format
    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      return new Response(JSON.stringify({
        error: "Invalid Stripe key format. Must start with 'sk_'."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }
    
    // Since we can't update secrets directly from edge functions,
    // we'll just verify the key format and tell the user to set it in dashboard
    console.log("Stripe key format is valid. Key should be set in Supabase dashboard.");
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Stripe secret key format is valid. Please set the key as STRIPE_SECRET_KEY in the Supabase dashboard under Edge Function secrets." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
