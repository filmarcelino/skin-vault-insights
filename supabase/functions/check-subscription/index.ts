
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
        error: "Autenticação necessária", 
        subscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Retornamos 200 mesmo com erro para evitar erros Non-2xx
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("Authentication error", { message: userError.message });
      return new Response(JSON.stringify({ 
        error: "Erro de autenticação", 
        subscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Retornamos 200 mesmo com erro para evitar erros Non-2xx
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No user email found");
      return new Response(JSON.stringify({ 
        error: "Email do usuário não disponível", 
        subscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Retornamos 200 mesmo com erro para evitar erros Non-2xx
      });
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    try {
      // Check if user exists as a customer with a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tempo limite excedido ao buscar cliente Stripe")), 15000);
      });
      
      const customersPromise = stripe.customers.list({ email: user.email, limit: 1 });
      const customers = await Promise.race([customersPromise, timeoutPromise]) as Stripe.ApiList<Stripe.Customer>;
      
      if (customers.data.length === 0) {
        logStep("No customer found for user");
        // Update subscriber status in database as not subscribed
        await supabaseClient.from("subscribers").upsert({
          user_id: user.id,
          email: user.email,
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
        new Promise((_, reject) => setTimeout(() => reject(new Error("Tempo limite excedido ao buscar assinaturas")), 15000))
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
        error: "Não foi possível verificar o status da assinatura. Tente novamente mais tarde."
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
