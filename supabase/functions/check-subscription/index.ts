
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    // Important: Check if the stripe key is in the correct format (should start with sk_)
    if (!stripeKey.startsWith("sk_")) {
      return new Response(JSON.stringify({ 
        error: "Invalid Stripe secret key format. The key should start with sk_", 
        subscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 even with error
      });
    }

    logStep("Stripe key verified");

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user token from request headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Missing authorization header");
      return new Response(JSON.stringify({ 
        error: "Authentication required", 
        subscribed: false 
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
        error: "Authentication error", 
        subscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 even with error
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No user email found");
      return new Response(JSON.stringify({ 
        error: "User email not available", 
        subscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 even with error
      });
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First, check if the user has an active trial in the subscribers table
    const { data: existingSubscriber, error: subscriberError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (subscriberError && subscriberError.code !== "PGRST116") { // Not found is ok
      logStep("Error checking subscriber record", { message: subscriberError.message });
    }

    // Check if user is on a trial period and it's still valid
    if (existingSubscriber?.is_trial && existingSubscriber?.subscription_end) {
      const trialEnd = new Date(existingSubscriber.subscription_end);
      const now = new Date();
      const isTrialActive = trialEnd > now;
      
      if (isTrialActive) {
        logStep("Active trial found", { 
          end_date: existingSubscriber.subscription_end,
          days_remaining: Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        });
        
        return new Response(JSON.stringify({ 
          subscribed: true, 
          is_trial: true,
          subscription_end: existingSubscriber.subscription_end
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // If we get here, trial has expired
      logStep("Trial expired", { end_date: existingSubscriber.subscription_end });
    }

    // Initialize Stripe
    let stripe: Stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    } catch (stripeInitError) {
      logStep("Stripe initialization error", { message: String(stripeInitError) });
      // Return default response, don't throw
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Could not initialize Stripe client"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    try {
      // Check if user exists as a customer with a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout exceeded while fetching Stripe customer")), 15000);
      });
      
      const customersPromise = stripe.customers.list({ email: user.email, limit: 1 });
      const customers = await Promise.race([customersPromise, timeoutPromise]) as Stripe.ApiList<Stripe.Customer>;
      
      if (customers.data.length === 0) {
        logStep("No customer found for user");
        
        // Check if we need to create a trial for a new user
        if (!existingSubscriber) {
          // Create a 7-day trial for new users
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 7); // 7 days trial
          
          await supabaseClient.from("subscribers").upsert({
            user_id: user.id,
            email: user.email,
            subscribed: true,
            is_trial: true,
            subscription_end: trialEnd.toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
          
          logStep("Created new trial subscription", { end_date: trialEnd.toISOString() });
          
          return new Response(JSON.stringify({ 
            subscribed: true,
            is_trial: true,
            subscription_end: trialEnd.toISOString()
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        
        // Update subscriber status in database as not subscribed
        await supabaseClient.from("subscribers").upsert({
          user_id: user.id,
          email: user.email,
          subscribed: false,
          is_trial: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
        return new Response(JSON.stringify({ 
          subscribed: false 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // Check for active subscriptions with timeout
      const subscriptionsPromise = stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      
      const subscriptions = await Promise.race([
        subscriptionsPromise, 
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout exceeded while fetching subscriptions")), 15000))
      ]) as Stripe.ApiList<Stripe.Subscription>;

      const hasActiveSubscription = subscriptions.data.length > 0;
      let subscriptionEndDate = null;
      let isInTrialPeriod = false;
      
      if (hasActiveSubscription) {
        const subscription = subscriptions.data[0];
        subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
        isInTrialPeriod = subscription.status === "trialing";
        
        logStep("Subscription status", { 
          active: true, 
          end: subscriptionEndDate, 
          trial: isInTrialPeriod 
        });
        
        // Update subscriber record in database
        await supabaseClient.from("subscribers").upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_end: subscriptionEndDate,
          is_trial: isInTrialPeriod,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
        return new Response(JSON.stringify({ 
          subscribed: true, 
          subscription_end: subscriptionEndDate,
          is_trial: isInTrialPeriod
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        logStep("No active subscription found");
        
        // Update subscriber record in database
        await supabaseClient.from("subscribers").upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
          subscribed: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
        return new Response(JSON.stringify({ 
          subscribed: false 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    } catch (stripeError) {
      // Handle Stripe API errors separately
      const errorMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);
      logStep("STRIPE API ERROR", { message: errorMessage });
      
      // Just return a default response without trying to access Stripe
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Could not verify subscription status. Please try again later."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Still return 200 with error message inside
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      subscribed: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Still return 200 with error details inside
    });
  }
});
