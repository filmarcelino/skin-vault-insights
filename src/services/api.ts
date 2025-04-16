
import { Skin, SkinCollection, SkinFilter } from "@/types/skin";
import { 
  getLocalWeapons, 
  getLocalCollections, 
  getLocalSkins, 
  getLocalSkinById 
} from "./local-data";

// Base API URL for bymykel CS2 API
const API_URL = "https://bymykel.github.io/CSGO-API/api/";

// Configuration for data sources
export const DataSourceConfig = {
  // Set to true to use local data instead of API
  useLocalData: false,
  
  // Custom JSON file paths (relative to public folder)
  customJsonPaths: {
    weapons: "",    // e.g., "data/weapons.json"
    collections: "", // e.g., "data/collections.json"
    skins: ""       // e.g., "data/skins.json"
  }
};

/**
 * Loads data from a custom JSON file in the public folder
 */
export const loadCustomJson = async <T>(path: string): Promise<T | null> => {
  if (!path) return null;
  
  try {
    const response = await fetch(`/${path}`);
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);
    return await response.json() as T;
  } catch (error) {
    console.error(`Error loading custom JSON (${path}):`, error);
    return null;
  }
};

/**
 * Fetches all available weapons from the API or custom JSON
 */
export const fetchWeapons = async (): Promise<string[]> => {
  // Try to load from custom JSON first
  if (DataSourceConfig.customJsonPaths.weapons) {
    const customData = await loadCustomJson<string[]>(DataSourceConfig.customJsonPaths.weapons);
    if (customData) return customData;
  }
  
  // Fallback to local data if enabled
  if (DataSourceConfig.useLocalData) {
    return getLocalWeapons();
  }
  
  // Otherwise use API
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
 * Fetches all available collections from the API or custom JSON
 */
export const fetchCollections = async (): Promise<SkinCollection[]> => {
  // Try to load from custom JSON first
  if (DataSourceConfig.customJsonPaths.collections) {
    const customData = await loadCustomJson<SkinCollection[]>(DataSourceConfig.customJsonPaths.collections);
    if (customData) return customData;
  }
  
  // Fallback to local data if enabled
  if (DataSourceConfig.useLocalData) {
    return getLocalCollections();
  }
  
  // Otherwise use API
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
 * Fetches all skins from the API or custom JSON
 */
export const fetchSkins = async (filters?: SkinFilter): Promise<Skin[]> => {
  let skins: any[] = [];
  
  // Try to load from custom JSON first
  if (DataSourceConfig.customJsonPaths.skins) {
    const customData = await loadCustomJson<Skin[]>(DataSourceConfig.customJsonPaths.skins);
    if (customData) {
      skins = customData;
    }
  }
  // Fallback to local data if enabled and no custom data
  else if (DataSourceConfig.useLocalData) {
    return getLocalSkins(filters?.search);
  }
  // Otherwise use API
  else {
    try {
      const response = await fetch(`${API_URL}skins.json`);
      if (!response.ok) throw new Error('Failed to fetch skins');
      skins = await response.json();
    } catch (error) {
      console.error("Error fetching skins:", error);
      return getLocalSkins(filters?.search);
    }
  }
  
  // Map and standardize the data format
  const mappedSkins = skins.map((skin: any) => ({
    id: skin.id || `${skin.weapon}-${skin.name}`.toLowerCase().replace(/\s+/g, '-'),
    name: skin.name,
    description: skin.description,
    weapon: skin.weapon,
    category: skin.category,
    rarity: skin.rarity,
    image: skin.image,
    wear: skin.wear,
    min_float: skin.min_float,
    max_float: skin.max_float,
    price: skin.price,
    collection: skin.collection ? {
      id: skin.collection.id || (skin.collection.name ? String(skin.collection.name).toLowerCase().replace(/\s+/g, '-') : undefined),
      name: skin.collection.name || "",
      description: skin.collection.description,
      image: skin.collection.image
    } : undefined
  }));
  
  // Apply filters if provided
  if (filters) {
    let filteredSkins = mappedSkins;
    
    if (filters.weapon) {
      filteredSkins = filteredSkins.filter(skin => 
        skin.weapon && skin.weapon.toLowerCase() === filters.weapon?.toLowerCase());
    }
    
    if (filters.category) {
      filteredSkins = filteredSkins.filter(skin => 
        skin.category && skin.category.toLowerCase() === filters.category?.toLowerCase());
    }
    
    if (filters.rarity) {
      filteredSkins = filteredSkins.filter(skin => 
        skin.rarity && skin.rarity.toLowerCase() === filters.rarity?.toLowerCase());
    }
    
    if (filters.collection) {
      filteredSkins = filteredSkins.filter(skin => 
        skin.collection && skin.collection.name && 
        skin.collection.name.toLowerCase() === filters.collection?.toLowerCase());
    }
    
    if (filters.minPrice !== undefined) {
      filteredSkins = filteredSkins.filter(skin => 
        skin.price !== undefined && skin.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      filteredSkins = filteredSkins.filter(skin => 
        skin.price !== undefined && skin.price <= filters.maxPrice!);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredSkins = filteredSkins.filter(skin => 
        (skin.name && skin.name.toLowerCase().includes(searchLower)) || 
        (skin.weapon && skin.weapon.toLowerCase().includes(searchLower)));
    }
    
    return filteredSkins;
  }
  
  return mappedSkins;
};

/**
 * Fetches a specific skin by ID
 */
export const fetchSkinById = async (id: string): Promise<Skin | null> => {
  // Try to load from custom JSON first
  if (DataSourceConfig.customJsonPaths.skins) {
    const allSkins = await fetchSkins();
    return allSkins.find(skin => skin.id === id) || null;
  }
  
  // Fallback to local data if enabled
  if (DataSourceConfig.useLocalData) {
    return getLocalSkinById(id);
  }
  
  // Otherwise use API
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
