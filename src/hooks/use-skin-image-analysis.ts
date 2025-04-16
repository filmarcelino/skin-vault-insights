
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useSkinImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    description?: string
    error?: string
  } | null>(null)

  const analyzeSkinImage = async (imageBase64: string) => {
    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('analyze-skin-image', {
        body: JSON.stringify({ imageBase64 })
      })

      if (error) throw error

      setAnalysisResult({
        description: data.description
      })
    } catch (error) {
      setAnalysisResult({
        error: error instanceof Error ? error.message : 'Erro desconhecido'
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
