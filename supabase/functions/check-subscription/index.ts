import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types for better type checking
type SubscriptionResponse = {
  subscribed: boolean;
  is_trial?: boolean;
  subscription_end?: string;
  error?: string;
};

type SubscriberRecord = {
  user_id: string;
  email: string;
  stripe_customer_id?: string;
  subscribed: boolean;
  is_trial: boolean;
  subscription_end?: string;
  updated_at: string;
};

// Helper functions
function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
}

function createSuccessResponse(data: SubscriptionResponse): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

function createErrorResponse(error: string, status: number = 200): Response {
  return new Response(JSON.stringify({ 
    error, 
    subscribed: false 
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

// Function to validate Stripe key format
function validateStripeKey(stripeKey: string | undefined): string | null {
  if (!stripeKey) {
    return "STRIPE_SECRET_KEY is not set";
  }
  
  if (!stripeKey.startsWith("sk_")) {
    return "Invalid Stripe secret key format. The key should start with sk_";
  }
  
  return null;
}

// Function to authenticate user from request
async function authenticateUser(supabaseClient: any, authHeader: string | null): Promise<{user: any, error: string | null}> {
  if (!authHeader) {
    logStep("Missing authorization header");
    return { user: null, error: "Authentication required" };
  }
  
  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError) {
    logStep("Authentication error", { message: userError.message });
    return { user: null, error: "Authentication error" };
  }
  
  const user = userData.user;
  if (!user?.email) {
    logStep("No user email found");
    return { user: null, error: "User email not available" };
  }
  
  logStep("User authenticated", { userId: user.id, email: user.email });
  return { user, error: null };
}

// Function to check for active trial subscription
async function checkTrialSubscription(supabaseClient: any, userId: string): Promise<{isActiveSubscription: boolean, subscriptionData?: any}> {
  const { data: existingSubscriber, error: subscriberError } = await supabaseClient
    .from("subscribers")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (subscriberError && subscriberError.code !== "PGRST116") {
    logStep("Error checking subscriber record", { message: subscriberError.message });
  }

  if (existingSubscriber?.is_trial && existingSubscriber?.subscription_end) {
    const trialEnd = new Date(existingSubscriber.subscription_end);
    const now = new Date();
    const isTrialActive = trialEnd > now;
    
    if (isTrialActive) {
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      logStep("Active trial found", { 
        end_date: existingSubscriber.subscription_end,
        days_remaining: daysRemaining
      });
      
      return { 
        isActiveSubscription: true,
        subscriptionData: {
          subscribed: true,
          is_trial: true,
          subscription_end: existingSubscriber.subscription_end
        }
      };
    }
    
    logStep("Trial expired", { end_date: existingSubscriber.subscription_end });
  }
  
  return { isActiveSubscription: false };
}

// Function to initialize Stripe client
function initializeStripe(stripeKey: string): Stripe | null {
  try {
    return new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  } catch (stripeInitError) {
    logStep("Stripe initialization error", { message: String(stripeInitError) });
    return null;
  }
}

// Function to check if user exists as Stripe customer
async function getStripeCustomer(stripe: Stripe, email: string): Promise<Stripe.Customer | null> {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout exceeded while fetching Stripe customer")), 15000);
    });
    
    const customersPromise = stripe.customers.list({ email, limit: 1 });
    const customers = await Promise.race([customersPromise, timeoutPromise]) as Stripe.ApiList<Stripe.Customer>;
    
    if (customers.data.length === 0) {
      logStep("No customer found for user");
      return null;
    }

    const customer = customers.data[0];
    logStep("Found Stripe customer", { customerId: customer.id });
    return customer;
  } catch (error) {
    logStep("Error fetching Stripe customer", { message: String(error) });
    return null;
  }
}

// Function to create trial for new users
async function createTrialSubscription(supabaseClient: any, user: any): Promise<SubscriptionResponse> {
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
  
  return { 
    subscribed: true,
    is_trial: true,
    subscription_end: trialEnd.toISOString()
  };
}

// Function to check for active Stripe subscriptions
async function checkStripeSubscriptions(stripe: Stripe, customerId: string): Promise<{hasActiveSubscription: boolean, subscriptionData?: any}> {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout exceeded while fetching subscriptions")), 15000);
    });
    
    const subscriptionsPromise = stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const subscriptions = await Promise.race([
      subscriptionsPromise, 
      timeoutPromise
    ]) as Stripe.ApiList<Stripe.Subscription>;

    const hasActiveSubscription = subscriptions.data.length > 0;
    
    if (hasActiveSubscription) {
      const subscription = subscriptions.data[0];
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
      const isInTrialPeriod = subscription.status === "trialing";
      
      logStep("Subscription status", { 
        active: true, 
        end: subscriptionEndDate, 
        trial: isInTrialPeriod 
      });
      
      return { 
        hasActiveSubscription: true,
        subscriptionData: {
          subscribed: true,
          subscription_end: subscriptionEndDate,
          is_trial: isInTrialPeriod
        }
      };
    } else {
      logStep("No active subscription found");
      return { hasActiveSubscription: false };
    }
  } catch (error) {
    logStep("Error checking subscriptions", { message: String(error) });
    throw error;
  }
}

// Function to update subscriber record in database
async function updateSubscriberRecord(
  supabaseClient: any, 
  userId: string, 
  email: string, 
  data: {
    stripe_customer_id?: string;
    subscribed: boolean;
    subscription_end?: string | null;
    is_trial?: boolean;
  }
): Promise<void> {
  await supabaseClient.from("subscribers").upsert({
    user_id: userId,
    email,
    ...data,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
}

// Main handler function
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // 1. Validate Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const keyError = validateStripeKey(stripeKey);
    if (keyError) {
      return createErrorResponse(keyError);
    }
    logStep("Stripe key verified");

    // 2. Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 3. Authenticate user
    const authHeader = req.headers.get("Authorization");
    const { user, error: authError } = await authenticateUser(supabaseClient, authHeader);
    if (authError) {
      return createErrorResponse(authError);
    }

    // 4. Check for existing trial subscription
    const { isActiveSubscription, subscriptionData } = await checkTrialSubscription(supabaseClient, user.id);
    if (isActiveSubscription && subscriptionData) {
      return createSuccessResponse(subscriptionData);
    }

    // 5. Initialize Stripe
    const stripe = initializeStripe(stripeKey!);
    if (!stripe) {
      return createErrorResponse("Could not initialize Stripe client");
    }

    try {
      // 6. Check if user exists as a Stripe customer
      const customer = await getStripeCustomer(stripe, user.email);
      
      // 7. Create trial for new users
      if (!customer) {
        // If no existing subscriber record, create a trial
        if (!await supabaseClient.from("subscribers").select("*").eq("user_id", user.id).single().then(r => r.data)) {
          const trialSubscription = await createTrialSubscription(supabaseClient, user);
          return createSuccessResponse(trialSubscription);
        }
        
        // Otherwise mark as not subscribed
        await updateSubscriberRecord(supabaseClient, user.id, user.email, { subscribed: false, is_trial: false });
        return createSuccessResponse({ subscribed: false });
      }

      // 8. Check for active subscriptions
      const { hasActiveSubscription, subscriptionData: stripeSubscriptionData } = 
        await checkStripeSubscriptions(stripe, customer.id);
      
      if (hasActiveSubscription && stripeSubscriptionData) {
        // Update subscriber record and return subscription data
        await updateSubscriberRecord(supabaseClient, user.id, user.email, {
          stripe_customer_id: customer.id,
          subscribed: true,
          subscription_end: stripeSubscriptionData.subscription_end,
          is_trial: stripeSubscriptionData.is_trial
        });
        
        return createSuccessResponse(stripeSubscriptionData);
      } else {
        // Update subscriber record as not subscribed
        await updateSubscriberRecord(supabaseClient, user.id, user.email, {
          stripe_customer_id: customer.id,
          subscribed: false
        });
        
        return createSuccessResponse({ subscribed: false });
      }
    } catch (stripeError) {
      // Handle Stripe API errors
      const errorMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);
      logStep("STRIPE API ERROR", { message: errorMessage });
      
      return createErrorResponse("Could not verify subscription status. Please try again later.");
    }
  } catch (error) {
    // Handle any uncaught errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return createErrorResponse(errorMessage);
  }
});
