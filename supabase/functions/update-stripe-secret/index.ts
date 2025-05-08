
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    
    // Update the Stripe secret in Supabase environment variables
    // This actually just sets the secret in the Deno environment for this function invocation
    // For a permanent update, you need to set it in the Supabase dashboard
    Deno.env.set("STRIPE_SECRET_KEY", stripeKey);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Stripe secret key format validated. To permanently update the key, please set it in the Supabase dashboard." 
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
