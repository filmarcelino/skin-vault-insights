
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Missing Stripe key");
      return new Response(JSON.stringify({ 
        error: "Payment configuration unavailable at the moment" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 even with error
      });
    }
    
    logStep("Stripe key verified");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user token from request headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Missing authorization header");
      return new Response(JSON.stringify({ 
        error: "Authentication required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 even with error
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("Authentication error", { message: userError.message });
      return new Response(JSON.stringify({ 
        error: "Authentication error" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 even with error
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No user email found");
      return new Response(JSON.stringify({ 
        error: "User email not available" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 even with error
      });
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    try {
      // Initialize Stripe
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      
      // Check if user exists as a customer with timeout
      const customersPromise = stripe.customers.list({ email: user.email, limit: 1 });
      const customers = await Promise.race([
        customersPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout exceeded while fetching customer")), 15000))
      ]) as Stripe.ApiList<Stripe.Customer>;
      
      if (customers.data.length === 0) {
        logStep("No customer found");
        return new Response(JSON.stringify({ 
          error: "No subscription found for this user" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // Create Stripe customer portal session with timeout
      const sessionPromise = stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.get("origin")}/`,
      });
      
      const session = await Promise.race([
        sessionPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout exceeded while creating portal")), 15000))
      ]) as Stripe.BillingPortal.Session;
      
      logStep("Created customer portal session", { session_id: session.id });
      
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      // Handle Stripe API errors separately
      const errorMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);
      logStep("STRIPE API ERROR", { message: errorMessage });
      
      return new Response(JSON.stringify({ 
        error: "Failed to access customer portal. Please try again later." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Still return 200 with error message inside
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Still return 200 with error details inside
    });
  }
});
