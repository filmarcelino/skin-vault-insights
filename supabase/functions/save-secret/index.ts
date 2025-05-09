
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

    // Get the authenticated user
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

    // Only admin can save secrets
    const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";
    if (userData.user?.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Unauthorized - Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse the request body
    const reqBody = await req.json();
    const { key, value } = reqBody;

    if (!key || !value) {
      return new Response(JSON.stringify({ error: "Missing key or value" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // This saves the secret to Edge Function secrets
    // Note: This is a placeholder - actual implementation would require access to Edge Function secret management
    console.log(`Secret ${key} would be saved here if we had direct access to Edge Function secrets management`);

    // Since we can't directly save secrets via Edge Functions,
    // this is a demonstration placeholder only
    return new Response(JSON.stringify({ 
      success: true, 
      message: "This is a demo - to actually save the secret, please add it manually in the Supabase dashboard" 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "Internal server error", details: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
