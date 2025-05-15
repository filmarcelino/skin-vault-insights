
// Import the fetchUserInventory function from the correct location
import { fetchUserInventory } from "@/services/inventory/inventory-service";
import { Skin } from "@/types/skin";

// Cache for skin data to improve performance
let skinsCache: Skin[] | null = null;
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes
let lastCacheTime = 0;

// Function to fetch all skins from the API
export const fetchSkins = async (): Promise<Skin[]> => {
  const now = Date.now();
  
  // Use cached data if available and not expired
  if (skinsCache && (now - lastCacheTime < CACHE_EXPIRY)) {
    console.log("Using cached skin data");
    return skinsCache;
  }
  
  console.log("Fetching fresh skin data from API");
  
  try {
    // Try fetching from the API
    const response = await fetch("https://bymykel.github.io/CSGO-API/api/en/skins.json");
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the API data into our Skin type
    const skins: Skin[] = data.map((item: any) => ({
      id: item.id || `skin_${Math.random().toString(36).substr(2, 9)}`,
      name: item.name,
      weapon: item.weapon?.name || "",
      image: item.image || "",
      rarity: item.rarity?.name || "Consumer Grade",
      category: item.category?.name || "",
      collection: item.collection ? { 
        id: item.collection.id || "", 
        name: item.collection.name || "",
        description: item.collection.description || "" 
      } : undefined,
      collections: item.collections ? item.collections.map((c: any) => ({
        id: c.id || "",
        name: c.name || "",
        description: c.description || ""
      })) : [],
      price: Math.floor(Math.random() * 10000) / 100, // Mock price since API doesn't provide real prices
      min_float: item.min_float,
      max_float: item.max_float,
      type: item.type?.name || ""
    }));
    
    // Update cache
    skinsCache = skins;
    lastCacheTime = now;
    
    console.log(`Retrieved ${skins.length} skins from API`);
    return skins;
  } catch (error) {
    console.error("Error fetching skins data from API:", error);
    
    // Try loading fallback data if API fails
    try {
      console.log("Loading fallback skin data");
      const fallbackResponse = await fetch("/fallback-skins.json");
      if (!fallbackResponse.ok) {
        throw new Error("Fallback data not available");
      }
      const fallbackData = await fallbackResponse.json();
      skinsCache = fallbackData;
      lastCacheTime = now;
      return fallbackData;
    } catch (fallbackError) {
      console.error("Error loading fallback skin data:", fallbackError);
      
      // Return empty array if all attempts fail
      return [];
    }
  }
};

// Export the fetchUserInventory function for convenience
export { fetchUserInventory };
