
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      return new Response(JSON.stringify({ error: "Authentication error" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Only admin can test webhooks
    const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";
    if (userData.user?.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Unauthorized - Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if webhook secret is configured
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Webhook secret (STRIPE_WEBHOOK_SECRET) is not configured" 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Here we would test the webhook configuration
    // Since we can't send a test event from Stripe programmatically,
    // we just check if the secret is configured
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Webhook secret is configured. Use the Stripe Dashboard to send test events."
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ 
      success: false,
      message: `Error: ${errorMessage}` 
    }), {
      status: 200,  // Still return 200 to display the error in the UI
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
