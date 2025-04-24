
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXCHANGE-RATES] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const apiKey = Deno.env.get("CURRENCYFREAKS_API_KEY");
    if (!apiKey) {
      logStep("Missing API key");
      return new Response(JSON.stringify({ 
        error: "API key not configured", 
        rates: {} 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Try to get cached rates first
    const cacheKey = `exchange_rates_${new Date().toISOString().split('T')[0]}`;
    const { data: cachedRates } = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/cache?key=eq.${cacheKey}`,
      {
        headers: {
          "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
        }
      }
    ).then(res => res.json()).catch(() => ({ data: null }));

    if (cachedRates && cachedRates.length > 0 && cachedRates[0].value) {
      logStep("Using cached rates", { cache_date: cachedRates[0].updated_at });
      return new Response(JSON.stringify(cachedRates[0].value), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Fetching fresh rates");
    const apiUrl = `https://api.currencyfreaks.com/latest?apikey=${apiKey}&symbols=USD,EUR,BRL,CNY,RUB,GBP`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Currency API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    logStep("Received rates", { base: data.base, date: data.date, currencies: Object.keys(data.rates).length });
    
    // Format the response
    const result = {
      base: data.base || "USD",
      date: data.date,
      rates: data.rates || {}
    };
    
    // Cache the results in Supabase for future requests
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/cache`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
        },
        body: JSON.stringify({
          key: cacheKey,
          value: result,
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hour expiry
        })
      });
      logStep("Cached rates successfully");
    } catch (cacheError) {
      logStep("Error caching rates", { error: String(cacheError) });
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      rates: {} 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
