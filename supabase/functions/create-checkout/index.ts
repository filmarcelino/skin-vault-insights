
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECKOUT] ${step}${detailsStr}`);
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Get request body for subscription plan selection
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      requestData = { plan: 'monthly' }; // Default to monthly if no plan specified
    }
    
    const plan = requestData?.plan || 'monthly';
    logStep("Request data", { plan });
    
    // Get Stripe key from environment
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Missing Stripe key");
      return new Response(JSON.stringify({ 
        error: "Payment configuration unavailable at the moment. STRIPE_SECRET_KEY not set." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 even with error
      });
    }
    
    logStep("Stripe key found");
    
    // Initialize Supabase client with service role key
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
    
    // Authenticate user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("Authentication error", { message: userError.message });
      return new Response(JSON.stringify({ 
        error: "Authentication error: " + userError.message
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
      // Initialize Stripe with timeout handling
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      logStep("Stripe initialized");
      
      // Check if user already exists as a customer with timeout
      logStep("Checking if customer exists");
      const customersPromise = stripe.customers.list({ email: user.email, limit: 1 });
      const customers = await Promise.race([
        customersPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout exceeded while fetching customer")), 30000))
      ]) as Stripe.ApiList<Stripe.Customer>;
      
      let customerId: string | undefined;
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
        
        // Check if customer already has an active subscription
        logStep("Checking for active subscriptions");
        const subscriptionsPromise = stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });
        
        const subscriptions = await Promise.race([
          subscriptionsPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout exceeded while checking subscriptions")), 30000))
        ]) as Stripe.ApiList<Stripe.Subscription>;
        
        if (subscriptions.data.length > 0) {
          logStep("Customer already has an active subscription");
          // Return URL to manage subscription instead
          const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${req.headers.get("origin")}`,
          });
          
          return new Response(JSON.stringify({ url: session.url, existingSubscription: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
      
      // Set up the plan details based on the selected plan
      let line_items;
      
      if (plan === 'annual') {
        // Annual plan with 10% discount ($3.99 * 12 months = $47.88, with 10% off = $43.09)
        line_items = [{
          price_data: {
            currency: "usd",
            recurring: {
              interval: "year",
              trial_period_days: 3,
            },
            product_data: {
              name: "CS Skin Vault Premium (Annual)",
              description: "Premium access to CS Skin Vault with 10% savings",
            },
            unit_amount: 4309, // $43.09 in cents (equivalent to $3.99/month with 10% discount)
          },
          quantity: 1,
        }];
      } else {
        // Default monthly plan
        line_items = [{
          price_data: {
            currency: "usd",
            recurring: {
              interval: "month",
              trial_period_days: 3,
            },
            product_data: {
              name: "CS Skin Vault Premium",
              description: "Premium access to CS Skin Vault",
            },
            unit_amount: 399, // $3.99 in cents
          },
          quantity: 1,
        }];
      }
      
      logStep("Creating checkout session", { customerId: customerId || "new customer" });
      
      // Create a Stripe Checkout session for a new subscription
      const sessionPromise = stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        mode: "subscription",
        line_items: line_items,
        success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}`,
      });
      
      const session = await Promise.race([
        sessionPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout exceeded while creating checkout")), 30000))
      ]) as Stripe.Checkout.Session;
      
      logStep("Checkout session created", { sessionId: session.id, url: session.url });
      
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      // Handle Stripe API errors separately
      const errorMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);
      logStep("STRIPE API ERROR", { message: errorMessage });
      
      return new Response(JSON.stringify({ 
        error: "Failed to create payment session: " + errorMessage
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Still return 200 with error message inside
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: "General error: " + errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Still return 200 with error details inside
    });
  }
});
