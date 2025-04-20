
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const EXCHANGERATE_API_KEY = Deno.env.get('EXCHANGERATE_API_KEY');
const CACHE_TTL = 3600; // 1 hora em segundos

interface ExchangeRateResponse {
  rates: Record<string, number>;
  timestamp: number;
}

let cachedRates: ExchangeRateResponse | null = null;
let lastFetch = 0;

serve(async (req) => {
  try {
    const now = Date.now();
    
    // Verificar se temos um cache válido
    if (cachedRates && (now - lastFetch) / 1000 < CACHE_TTL) {
      return new Response(JSON.stringify(cachedRates), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Se não temos cache válido, buscar novas taxas
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${EXCHANGERATE_API_KEY}/latest/USD`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    cachedRates = {
      rates: data.conversion_rates,
      timestamp: now,
    };
    
    lastFetch = now;

    return new Response(JSON.stringify(cachedRates), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
