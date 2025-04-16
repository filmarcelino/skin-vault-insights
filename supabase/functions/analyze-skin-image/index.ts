
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageBase64 } = await req.json()

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system', 
            content: `Você é um especialista em identificar skins de armas do CS:GO. 
                      Analise a imagem e forneça informações detalhadas sobre:
                      1. Nome da arma (ex: AK-47, M4A4, AWP)
                      2. Nome da skin (ex: Vulcan, Asiimov, Dragon Lore)
                      3. Condição de desgaste (Factory New, Minimal Wear, Field-Tested, Well-Worn, Battle-Scarred)
                      4. Raridade (Consumer Grade, Industrial Grade, Mil-Spec, Restricted, Classified, Covert, Contraband)
                      5. Se é StatTrak ou não
                      6. Coleção a que pertence (se identificável)
                      7. Estimativa de faixa de preço (se possível)
                      8. Características únicas ou padrões especiais (se houver)
                      
                      Formate a resposta de forma clara e organizada. Se algum detalhe não for visível ou identificável na imagem, indique isso.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identifique esta skin do CS:GO com o máximo de detalhes possível.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    })

    const data = await response.json()
    console.log("OpenAI response:", data)
    
    if (data.error) {
      throw new Error(`OpenAI Error: ${data.error.message || 'Unknown error'}`)
    }
    
    const skinDescription = data.choices[0].message.content

    return new Response(JSON.stringify({ 
      success: true, 
      description: skinDescription 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error analyzing skin:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
