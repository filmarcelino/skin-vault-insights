
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Skin } from '@/types/skin'

export interface SkinAnalysisResult {
  description?: string
  error?: string
  skinData?: Skin
}

export const useSkinImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null)
  const { toast } = useToast()

  const analyzeSkinImage = async (imageBase64: string) => {
    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      console.log("Enviando imagem para análise...")
      
      const { data, error } = await supabase.functions.invoke('analyze-skin-image', {
        body: JSON.stringify({ imageBase64 })
      })

      if (error) {
        console.error("Erro na função analyze-skin-image:", error)
        throw error
      }

      console.log("Resposta da análise:", data)

      // Criar um objeto Skin com os dados retornados da análise
      const skinData: Skin = {
        id: `skin-${Date.now()}`,
        name: data.skinName || "Unknown Skin",
        weapon: data.weaponName || "Unknown",
        rarity: data.rarity || "",
        wear: data.wear || "",
        image: `data:image/jpeg;base64,${imageBase64}`,
        price: data.estimatedPrice || 0,
        floatValue: data.floatValue ? parseFloat(data.floatValue) : undefined,
      }

      setAnalysisResult({
        description: data.description,
        skinData: skinData
      })
      
      toast({
        title: "Análise concluída",
        description: "A skin foi analisada com sucesso"
      })
      
    } catch (error) {
      console.error("Erro ao analisar skin:", error)
      setAnalysisResult({
        error: error instanceof Error ? error.message : 'Erro desconhecido na análise da imagem'
      })
      
      toast({
        title: "Falha na análise",
        description: "Não foi possível analisar a imagem",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return { 
    analyzeSkinImage, 
    isAnalyzing, 
    analysisResult 
  }
}
