
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";
    
    // Inicializar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    // Verificar autenticação do usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Autenticação necessária" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Erro de autenticação" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      });
    }
    
    // Verificar se o usuário é administrador
    if (userData.user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Acesso não autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403
      });
    }
    
    // Pegar chave Stripe da requisição
    const { stripeKey } = await req.json();
    
    if (!stripeKey || !stripeKey.startsWith("sk_")) {
      return new Response(JSON.stringify({ 
        error: "Chave Stripe inválida. Deve começar com 'sk_'" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    // Atualizar a secret no Supabase usando a função Admin
    // Esta operação só pode ser realizada pelo Supabase Dashboard ou CLI
    // Aqui apenas simulamos o sucesso, pois a configuração real deve ser feita pelo admin
    console.log("Tentativa de atualização da chave Stripe:", stripeKey.substring(0, 5) + "...");

    // Em produção, você precisaria implementar a lógica de armazenamento seguro
    // Isso poderia ser feito através de uma tabela de configuração com RLS adequada
    // Ou idealmente pela interface de secrets do Supabase
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Solicitação de atualização da chave Stripe recebida. Para finalizar a configuração, o administrador deve adicionar esta chave nas configurações de secrets do Supabase." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    
    return new Response(JSON.stringify({ 
      error: "Erro ao processar solicitação de atualização da chave" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
