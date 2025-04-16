
// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResponse {
  description: string;
  weaponName?: string;
  skinName?: string;
  wear?: string;
  rarity?: string;
  estimatedPrice?: number;
  floatValue?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "É necessário fornecer uma imagem para análise" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Enviando imagem para análise com OpenAI...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em CS:GO e skins. Analise a imagem de uma skin de CS:GO e extraia:
            1. Nome da arma (weaponName) - seja específico e preciso, incluindo o modelo exato como "AWP", "AK-47", "M4A4", etc.
            2. Nome da skin/pintura (skinName) - apenas o nome da skin, sem o nome da arma, como "Asiimov", "Dragon Lore", "Fade", etc.
            3. Condição de desgaste (wear): Factory New, Minimal Wear, Field-Tested, Well-Worn ou Battle-Scarred
            4. Raridade (rarity): Consumer Grade, Industrial Grade, Mil-Spec Grade, Restricted, Classified, Covert ou Contraband
            5. Valor Float estimado (floatValue): um número entre 0 e 1
            6. Preço estimado em USD (estimatedPrice)
            7. Uma descrição breve da skin
            
            Formate sua resposta em JSON com esses campos específicos. Seja o mais preciso possível na identificação dos nomes corretos tanto da arma quanto da skin, para facilitar a pesquisa no banco de dados. Se não conseguir identificar algum campo com certeza, deixe-o vazio.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              {
                type: "text",
                text: "Identifique esta skin de CS:GO com os detalhes pedidos."
              }
            ],
          },
        ],
        response_format: { "type": "json_object" }
      }),
    });

    const data = await response.json();
    console.log("Resposta do OpenAI recebida:", data);

    if (data.error) {
      throw new Error(`Erro OpenAI: ${data.error.message || JSON.stringify(data.error)}`);
    }

    // Extrair a resposta do OpenAI
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) {
      throw new Error("Formato de resposta inválido do OpenAI");
    }

    // Tenta fazer o parse do JSON da resposta
    let analysisData: AnalysisResponse;
    try {
      analysisData = JSON.parse(content);
    } catch (e) {
      console.error("Erro ao fazer parse do JSON:", e);
      console.log("Conteúdo recebido:", content);
      throw new Error("Falha ao processar resposta da análise");
    }

    return new Response(
      JSON.stringify(analysisData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro desconhecido ao analisar a imagem" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
