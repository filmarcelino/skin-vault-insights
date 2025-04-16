
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Skin } from '@/types/skin'
import { searchSkins } from '@/services/api'

export interface SkinAnalysisResult {
  description?: string
  error?: string
  skinData?: Skin
  foundSkins?: Skin[]
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
      
      // Buscar skins correspondentes baseado no nome da arma e nome da skin
      let foundSkins: Skin[] = []
      
      if (data.weaponName && data.skinName) {
        console.log("Buscando skins correspondentes...")
        // Usar o nome da arma + nome da skin como termo de pesquisa
        const searchTerm = `${data.weaponName} ${data.skinName}`.trim()
        foundSkins = await searchSkins(searchTerm)
        console.log("Skins encontradas:", foundSkins)
      }

      setAnalysisResult({
        description: data.description,
        skinData: skinData,
        foundSkins: foundSkins
      })
      
      toast({
        title: "Análise concluída",
        description: foundSkins.length > 0 
          ? `${foundSkins.length} skins correspondentes encontradas` 
          : "A skin foi analisada com sucesso"
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
