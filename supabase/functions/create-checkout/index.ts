
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      requestData = { plan: 'monthly' }; // fallback
    }
    const plan = requestData?.plan || 'monthly';
    const couponCode = (requestData?.coupon || "").trim().toUpperCase();

    logStep("Request data", { plan, coupon: couponCode });
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Missing Stripe key");
      return new Response(JSON.stringify({ 
        error: "Payment configuration unavailable at the moment. STRIPE_SECRET_KEY not set." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("Stripe key found", { keyLength: stripeKey.length });
    
    // Verify that the key begins with sk_ (indicating it's a secret key, not publishable)
    if (!stripeKey.startsWith('sk_')) {
      logStep("Invalid Stripe key format");
      return new Response(JSON.stringify({ 
        error: "Payment configuration is invalid. STRIPE_SECRET_KEY must start with 'sk_'." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
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
        status: 200,
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
        status: 200,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No user email found");
      return new Response(JSON.stringify({ 
        error: "User email not available" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    try {
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      logStep("Stripe initialized");
      
      // Check if user already exists as a customer
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
          // Return URL to manage subscription
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

      // Lógica do cupom
      let trial_days = 3; // padrão
      if (couponCode.length > 0) {
        logStep("Checking coupon", { couponCode });
        // procurar um cupom ativo
        const { data: couponRow, error: couponError } = await supabaseClient
          .from("coupons")
          .select("*")
          .eq("code", couponCode)
          .eq("active", true)
          .maybeSingle();

        if (couponError) {
          logStep("Error fetching coupon", { error: couponError.message });
          return new Response(JSON.stringify({ error: "Erro ao verificar cupom: " + couponError.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        if (!couponRow) {
          logStep("Invalid coupon", { code: couponCode });
          return new Response(JSON.stringify({ error: "Cupom inválido ou inativo." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        
        // já foi usado por esse usuário?
        const { data: used, error: usedErr } = await supabaseClient
          .from("user_coupons")
          .select("*")
          .eq("user_id", user.id)
          .eq("coupon_id", couponRow.id)
          .maybeSingle();

        if (usedErr) {
          logStep("Error checking coupon usage", { error: usedErr.message });
        }

        if (used) {
          return new Response(JSON.stringify({ error: "Cupom já utilizado na sua conta." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        
        // validar se atingiu o máximo de usos
        if (couponRow.max_redemptions &&
            couponRow.times_redeemed &&
            couponRow.times_redeemed >= couponRow.max_redemptions
        ) {
          return new Response(JSON.stringify({ error: "Esse cupom já atingiu o limite de usos." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        // Cupom válido: concede trial personalizado
        trial_days = couponRow.duration_months * 30; // cada mês = 30 dias

        // registrar cupom na tabela user_coupons (marcar como usado)
        const { error: userCouponError } = await supabaseClient.from("user_coupons").insert({
          user_id: user.id,
          coupon_id: couponRow.id,
          applied_at: new Date().toISOString(),
          expires_at: null, // pode ser gerenciado depois, após subscrição terminada
        });
        
        if (userCouponError) {
          logStep("Error recording coupon usage", { error: userCouponError.message });
          // Continuamos o fluxo mesmo com erro para garantir uma boa experiência ao usuário
        }

        // incrementa times_redeemed
        const { error: updateError } = await supabaseClient.from("coupons")
          .update({ times_redeemed: (couponRow.times_redeemed ?? 0) + 1 })
          .eq("id", couponRow.id);
          
        if (updateError) {
          logStep("Error updating coupon usage count", { error: updateError.message });
          // Continuamos o fluxo mesmo com erro
        }

        logStep("Valid coupon applied", { trial_days });
      }
      
      // Definição de planos
      let line_items;
      if (plan === 'annual') {
        line_items = [{
          price_data: {
            currency: "usd",
            recurring: {
              interval: "year",
              trial_period_days: trial_days,
            },
            product_data: {
              name: "CS Skin Vault Premium (Annual)",
              description: "Premium access to CS Skin Vault with 10% savings",
            },
            unit_amount: 4300, // $43.00 in cents
          },
          quantity: 1,
        }];
      } else {
        line_items = [{
          price_data: {
            currency: "usd",
            recurring: {
              interval: "month",
              trial_period_days: trial_days,
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
      
      logStep("Creating checkout session", { customerId: customerId || "new customer", trial_days, plan, coupon: couponCode });

      const sessionPromise = stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        mode: "subscription",
        line_items,
        success_url: `${req.headers.get("origin")}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/subscription`,
      });
      
      const session = await Promise.race([
        sessionPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout exceeded while creating checkout")), 30000))
      ]) as Stripe.Checkout.Session;

      logStep("Checkout session created", { sessionId: session.id, url: session.url });
      
      // Registrar que foi aplicado um trial (se houver cupom)
      if (couponCode.length > 0 && trial_days > 3) {
        const { error: subError } = await supabaseClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          is_trial: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
        
        if (subError) {
          logStep("Error registering trial status", { error: subError.message });
          // Continuamos o fluxo mesmo com erro
        } else {
          logStep("Recorded trial status successfully");
        }
      }
      
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (stripeError) {
      const errorMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);
      logStep("STRIPE API ERROR", { message: errorMessage });
      return new Response(JSON.stringify({ 
        error: "Failed to create payment session: " + errorMessage
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "General error: " + errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
