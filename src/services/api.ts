
import { Skin, SkinCollection, SkinFilter } from "@/types/skin";
import { 
  getLocalWeapons, 
  getLocalCollections, 
  getLocalSkins, 
  getLocalSkinById 
} from "./local-data";

// Base API URL for bymykel CS2 API
const API_URL = "https://bymykel.github.io/CSGO-API/api/";

// Set to true to use local data instead of API
const USE_LOCAL_BACKUP = false;

/**
 * Fetches all available weapons from the API
 */
export const fetchWeapons = async (): Promise<string[]> => {
  if (USE_LOCAL_BACKUP) {
    return getLocalWeapons();
  }
  
  try {
    const response = await fetch(`${API_URL}weapons.json`);
    if (!response.ok) throw new Error('Failed to fetch weapons');
    const data = await response.json();
    return data.map((weapon: any) => weapon.name);
  } catch (error) {
    console.error("Error fetching weapons:", error);
    // Fallback to local data if API fails
    return getLocalWeapons();
  }
};

/**
 * Fetches all available collections from the API
 */
export const fetchCollections = async (): Promise<SkinCollection[]> => {
  if (USE_LOCAL_BACKUP) {
    return getLocalCollections();
  }
  
  try {
    const response = await fetch(`${API_URL}collections.json`);
    if (!response.ok) throw new Error('Failed to fetch collections');
    const data = await response.json();
    return data.map((collection: any) => ({
      id: collection.id || String(collection.name).toLowerCase().replace(/\s+/g, '-'),
      name: collection.name,
      description: collection.description,
      image: collection.image
    }));
  } catch (error) {
    console.error("Error fetching collections:", error);
    return getLocalCollections();
  }
};

/**
 * Fetches all skins from the API
 */
export const fetchSkins = async (filters?: SkinFilter): Promise<Skin[]> => {
  if (USE_LOCAL_BACKUP) {
    return getLocalSkins(filters?.search);
  }
  
  try {
    const response = await fetch(`${API_URL}skins.json`);
    if (!response.ok) throw new Error('Failed to fetch skins');
    
    let data = await response.json();
    
    // Apply filters if provided
    if (filters) {
      if (filters.weapon) {
        data = data.filter((skin: any) => 
          skin.weapon && skin.weapon.toLowerCase() === filters.weapon?.toLowerCase());
      }
      
      if (filters.category) {
        data = data.filter((skin: any) => 
          skin.category && skin.category.toLowerCase() === filters.category?.toLowerCase());
      }
      
      if (filters.rarity) {
        data = data.filter((skin: any) => 
          skin.rarity && skin.rarity.toLowerCase() === filters.rarity?.toLowerCase());
      }
      
      if (filters.collection) {
        data = data.filter((skin: any) => 
          skin.collection && skin.collection.name.toLowerCase() === filters.collection?.toLowerCase());
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        data = data.filter((skin: any) => 
          (skin.name && skin.name.toLowerCase().includes(searchLower)) || 
          (skin.weapon && skin.weapon.toLowerCase().includes(searchLower)));
      }
    }
    
    return data.map((skin: any) => ({
      id: skin.id || `${skin.weapon}-${skin.name}`.toLowerCase().replace(/\s+/g, '-'),
      name: skin.name,
      description: skin.description,
      weapon: skin.weapon,
      category: skin.category,
      rarity: skin.rarity,
      image: skin.image,
      min_float: skin.min_float,
      max_float: skin.max_float
    }));
  } catch (error) {
    console.error("Error fetching skins:", error);
    return getLocalSkins(filters?.search);
  }
};

/**
 * Fetches a specific skin by ID
 */
export const fetchSkinById = async (id: string): Promise<Skin | null> => {
  if (USE_LOCAL_BACKUP) {
    return getLocalSkinById(id);
  }
  
  try {
    const skins = await fetchSkins();
    return skins.find(skin => skin.id === id) || null;
  } catch (error) {
    console.error("Error fetching skin by ID:", error);
    return getLocalSkinById(id);
  }
};

/**
 * Search for skins by name or weapon
 */
export const searchSkins = async (query: string): Promise<Skin[]> => {
  return fetchSkins({ search: query });
};
