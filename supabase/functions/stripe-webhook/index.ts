
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logEvent(event: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${event}${detailsStr}`);
}

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSignature = req.headers.get("stripe-signature");
    if (!stripeSignature) {
      logEvent("Missing Stripe signature");
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      logEvent("Missing environment variables", { missingKey: !stripeKey, missingSecret: !webhookSecret });
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the raw request body
    const body = await req.text();
    
    // Initialize Stripe and construct the event
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, stripeSignature, webhookSecret);
    } catch (err) {
      logEvent("Invalid webhook signature", { error: err.message });
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    logEvent("Received event", { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logEvent("Checkout completed", { 
          customer: session.customer, 
          customerEmail: session.customer_email,
          mode: session.mode
        });

        if (session.mode === 'subscription' && (session.customer || session.customer_email)) {
          // Process completed checkout for new subscription
          const customerId = session.customer as string;
          const customerEmail = session.customer_email as string;
          
          // Find subscription details
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1
          });

          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
            const isInTrialPeriod = subscription.status === "trialing";

            // Update subscriber status in the database
            await supabaseClient.from("subscribers").upsert({
              email: customerEmail,
              stripe_customer_id: customerId,
              subscribed: true,
              is_trial: isInTrialPeriod,
              subscription_end: subscriptionEnd,
              updated_at: new Date().toISOString()
            }, { onConflict: 'email' });

            logEvent("Subscriber updated for new checkout", { 
              email: customerEmail,
              subscriptionEnd,
              isInTrialPeriod
            });
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get customer details
        const customerId = subscription.customer as string;
        try {
          const customer = await stripe.customers.retrieve(customerId);
          
          if (customer.deleted) {
            logEvent("Customer deleted", { customerId });
            break;
          }

          const customerEmail = customer.email;
          if (!customerEmail) {
            logEvent("Customer email not available", { customerId });
            break;
          }

          const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          const isInTrialPeriod = subscription.status === "trialing";
          const isActive = subscription.status === "active" || subscription.status === "trialing";

          // Update subscriber status in database
          await supabaseClient.from("subscribers").upsert({
            email: customerEmail,
            stripe_customer_id: customerId,
            subscribed: isActive,
            is_trial: isInTrialPeriod,
            subscription_end: subscriptionEnd,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });

          logEvent("Subscription updated", { 
            customerId, 
            customerEmail, 
            status: subscription.status,
            subscriptionEnd
          });
        } catch (err) {
          logEvent("Error retrieving customer", { customerId, error: err.message });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        try {
          const customer = await stripe.customers.retrieve(customerId);
          
          if (customer.deleted) {
            logEvent("Customer deleted", { customerId });
            break;
          }

          const customerEmail = customer.email;
          if (!customerEmail) {
            logEvent("Customer email not available", { customerId });
            break;
          }

          // Update subscriber status to indicate no active subscription
          await supabaseClient.from("subscribers").upsert({
            email: customerEmail,
            stripe_customer_id: customerId,
            subscribed: false,
            is_trial: false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });

          logEvent("Subscription canceled", { customerId, customerEmail });
        } catch (err) {
          logEvent("Error retrieving customer", { customerId, error: err.message });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customerId = subscription.customer as string;
          
          try {
            const customer = await stripe.customers.retrieve(customerId);
            
            if (customer.deleted) {
              logEvent("Customer deleted", { customerId });
              break;
            }

            const customerEmail = customer.email;
            if (!customerEmail) {
              logEvent("Customer email not available", { customerId });
              break;
            }

            const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
            
            // Update subscriber record with new subscription end date
            await supabaseClient.from("subscribers").upsert({
              email: customerEmail,
              stripe_customer_id: customerId,
              subscribed: true,
              is_trial: subscription.status === "trialing",
              subscription_end: subscriptionEnd,
              updated_at: new Date().toISOString()
            }, { onConflict: 'email' });

            logEvent("Invoice payment succeeded", { 
              customerId, 
              customerEmail, 
              invoice: invoice.id,
              newSubscriptionEnd: subscriptionEnd
            });
          } catch (err) {
            logEvent("Error retrieving customer", { customerId, error: err.message });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const customerId = invoice.customer as string;
          
          try {
            const customer = await stripe.customers.retrieve(customerId);
            
            if (customer.deleted) {
              logEvent("Customer deleted", { customerId });
              break;
            }

            const customerEmail = customer.email;
            if (!customerEmail) {
              logEvent("Customer email not available", { customerId });
              break;
            }

            // We don't update subscription status here, as Stripe will retry payment
            // and eventually either succeed or cancel the subscription
            
            logEvent("Invoice payment failed", { 
              customerId, 
              customerEmail, 
              invoice: invoice.id 
            });
          } catch (err) {
            logEvent("Error retrieving customer", { customerId, error: err.message });
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logEvent("Unhandled error", { error: errorMessage });
    
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
