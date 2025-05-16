
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skin } from '@/types/skin';
import { searchSkins } from '@/services/api';

interface AnalysisResult {
  description?: string;
  foundSkins?: Skin[];
  skinData?: Skin;
  error?: string;
}

export const useSkinImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeSkinImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-skin-image', {
        body: { image: base64Image }
      });

      if (error) {
        console.error("Error analyzing skin image:", error);
        setAnalysisResult({
          error: "Error analyzing image. Please try again."
        });
        return;
      }

      if (!data || !data.success) {
        setAnalysisResult({
          error: data?.message || "Could not analyze image. Please try again."
        });
        return;
      }

      // Handle successful analysis
      const { name, weapon, description } = data;

      // Create partial skin object from analysis
      const skinData: Partial<Skin> = {
        name: name || "Unknown Skin",
        weapon: weapon || "Unknown Weapon",
        rarity: "Consumer Grade",
        category: "Normal",
        image: "/placeholder-skin.png",
        price: 0,
        id: `temp-${Date.now()}`
      };

      // Search for similar skins in our database
      const searchQuery = `${weapon || ""} ${name || ""}`.trim();
      const matchingSkins = searchQuery ? await searchSkins(searchQuery) : [];

      // Set the final result
      setAnalysisResult({
        description: description || "No detailed information available for this skin.",
        foundSkins: matchingSkins.slice(0, 8), // Limit to first 8 matches
        skinData: skinData as Skin
      });
    } catch (error) {
      console.error("Exception analyzing skin image:", error);
      setAnalysisResult({
        error: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzeSkinImage, isAnalyzing, analysisResult };
};
