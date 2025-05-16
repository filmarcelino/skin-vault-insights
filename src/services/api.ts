import { DataSourceConfig } from "./api-config";
import { Skin } from "@/types/skin";

// Helper function to fetch data from the API
const fetchFromApi = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skins`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching skins from API:", error);
    throw error;
  }
};

// Helper function to fetch data from local JSON files
const fetchFromLocal = async (): Promise<any[]> => {
  try {
    const response = await fetch(DataSourceConfig.customJsonPaths.skins);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching skins from local JSON:", error);
    return [];
  }
};

// Adding a cache mechanism to improve performance
let skinsCache: any = null;
let skinsCacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Performance optimized fetchSkins function
export const fetchSkins = async (): Promise<any[]> => {
  const now = Date.now();
  
  // Return cached data if valid and not expired
  if (skinsCache && (now - skinsCacheTimestamp) < CACHE_DURATION) {
    console.log("Using cached skins data");
    return skinsCache;
  }
  
  console.log("Fetching fresh skins data");
  
  try {
    // Attempt to get from API
    let data = await fetchFromApi();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      // Fallback to local data if API fails
      data = await fetchFromLocal();
    }
    
    // Update cache
    skinsCache = data;
    skinsCacheTimestamp = now;
    
    return data;
  } catch (error) {
    console.error("Error fetching skins:", error);
    
    // If cache exists but expired, still use it as fallback
    if (skinsCache) {
      console.log("Using expired cache as fallback");
      return skinsCache;
    }
    
    // Last resort - fetch from local data
    return fetchFromLocal();
  }
};

// Method to prefetch skins data in background
export const prefetchSkinsData = async () => {
  if (!skinsCache || (Date.now() - skinsCacheTimestamp > CACHE_DURATION)) {
    console.log("Prefetching skins data in background");
    try {
      fetchSkins();
    } catch (error) {
      console.error("Error prefetching skins:", error);
    }
  }
};

// Clear cache method
export const clearSkinsCache = () => {
  skinsCache = null;
  skinsCacheTimestamp = 0;
  console.log("Skins cache cleared");
};

// Helper method to get available weapons
export const getWeapons = async (): Promise<string[]> => {
  try {
    const skins = await fetchSkins();
    const weapons = [...new Set(skins.map(skin => skin.weapon).filter(Boolean))];
    return weapons.sort() as string[];
  } catch (error) {
    console.error("Error fetching weapons:", error);
    return [];
  }
};

// Helper method to get available rarities
export const getRarities = async (): Promise<string[]> => {
  try {
    const skins = await fetchSkins();
    const rarities = [...new Set(skins.map(skin => skin.rarity).filter(Boolean))];
    return rarities as string[];
  } catch (error) {
    console.error("Error fetching rarities:", error);
    return [];
  }
};
