
import { useState } from 'react';
import { Skin } from '@/types/skin';
import { fetchSkins } from '@/services/api';

interface AnalysisResult {
  skinData?: Skin;
  foundSkins?: Skin[];
  description?: string;
  error?: string;
}

export const useSkinImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Search for skins based on name
  const searchSkins = async (query: string): Promise<Skin[]> => {
    if (!query) return [];
    
    try {
      const allSkins = await fetchSkins();
      return allSkins.filter(skin => 
        skin.name?.toLowerCase().includes(query.toLowerCase()) ||
        skin.weapon?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching skins:", error);
      return [];
    }
  };

  const analyzeSkinImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // Mock implementation - in real app this would call the analyze-skin-image function
      console.log("Analyzing skin image...");
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock detection of a skin
      const detectedName = "Asiimov";
      const detectedWeapon = "AWP";
      
      // Search for matching skins
      const foundSkins = await searchSkins(detectedName);
      
      // Create result
      const result: AnalysisResult = {
        skinData: {
          id: "mock-detection",
          name: detectedName,
          weapon: detectedWeapon,
          image: "/placeholder-skin.png",
          price: 50,
          rarity: "Classified",
          category: "Normal",
          collections: ["Operation Phoenix"]
        },
        foundSkins: foundSkins.slice(0, 4),
        description: `Detected ${detectedWeapon} | ${detectedName}. This appears to be a popular skin from CS2.`
      };
      
      setAnalysisResult(result);
      return result;
    } catch (error) {
      console.error("Error analyzing skin image:", error);
      const errorResult = {
        error: "Failed to analyze image. Please try again."
      };
      setAnalysisResult(errorResult);
      return errorResult;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeSkinImage,
    isAnalyzing,
    analysisResult
  };
};
