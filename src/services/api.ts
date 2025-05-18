
import { Skin, SkinCollection, SkinFilter } from "@/types/skin";
import { 
  getLocalWeapons, 
  getLocalCollections, 
  getLocalSkins, 
  getLocalSkinById 
} from "./local-data";
import { fetchUserInventory } from "@/services/inventory";

// Base API URL for CS:GO API from GitHub
const API_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/";

// Configuration for data sources
export const DataSourceConfig = {
  // Set to false to use API instead of local data
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
    // In the new API, we need to extract weapon names from skins
    const skins = await fetchSkins();
    // Extract unique weapon names
    const weaponNames = [...new Set(skins.map(skin => skin.weapon || ""))].filter(name => name);
    return weaponNames;
  } catch (error) {
    console.error("Error fetching weapons:", error);
    // Fallback to local data if API fails
    return getLocalWeapons();
  }
};

/**
 * Fetches all available categories from the API or custom JSON
 */
export const fetchCategories = async (): Promise<string[]> => {
  try {
    // Extrair categorias das skins
    const skins = await fetchSkins();
    
    // Extrair categorias únicas
    const categories = [...new Set(skins.map(skin => skin.category || ""))].filter(name => name);
    
    console.log("Found categories:", categories);
    return categories.sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
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
    // In the new API structure, we need to extract collections from skins
    const skins = await fetchSkins();
    const collections: SkinCollection[] = [];
    const collectionMap = new Map<string, SkinCollection>();
    
    // Extract unique collections
    skins.forEach(skin => {
      if (skin.collections && skin.collections.length > 0) {
        skin.collections.forEach(collection => {
          if (collection.id && !collectionMap.has(collection.id)) {
            collectionMap.set(collection.id, {
              id: collection.id,
              name: collection.name,
              description: '',
              image: collection.image
            });
          }
        });
      }
    });
    
    return Array.from(collectionMap.values());
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
  
  // If we only want user inventory skins, return them directly
  if (filters?.onlyUserInventory) {
    const inventoryItems = await fetchUserInventory();
    // Convert InventoryItems to Skin objects to match the expected return type
    return inventoryItems.map(item => ({
      id: item.id,
      name: item.name,
      weapon: item.weapon,
      image: item.image,
      rarity: item.rarity || "Unknown", // Ensure rarity is never undefined
      price: item.price || 0, // Ensure price is never undefined
      category: item.category || "",
      wear: item.wear,
      isStatTrak: item.isStatTrak,
      floatValue: item.floatValue,
      // Any other fields needed for Skin
    }));
  }
  
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
    id: skin.id || `${skin.weapon?.name || ""}-${skin.name}`.toLowerCase().replace(/\s+/g, '-'),
    name: skin.name?.split("|")[1]?.trim() || skin.name,
    description: skin.description,
    weapon: skin.weapon?.name || "",
    category: skin.category?.name || "",
    rarity: skin.rarity?.name || "Common", // Default rarity to ensure it's never undefined
    image: skin.image,
    wear: "", // Will be updated after filtering by wear
    min_float: skin.min_float,
    max_float: skin.max_float,
    price: Math.floor(Math.random() * 1000) + 1, // Random price for demo purposes
    collection: skin.collections && skin.collections.length > 0 ? {
      id: skin.collections[0].id,
      name: skin.collections[0].name,
      description: '',
      image: skin.collections[0].image
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
      const searchTerms = filters.search.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      
      // Pesquisa melhorada: cada termo de pesquisa deve corresponder a pelo menos uma parte do nome ou arma
      filteredSkins = filteredSkins.filter(skin => {
        const fullName = `${skin.weapon || ""} ${skin.name || ""}`.toLowerCase();
        const category = skin.category?.toLowerCase() || "";
        
        // Cada termo deve corresponder a alguma parte do nome, categoria, raridade ou coleção
        return searchTerms.every(term => 
          fullName.includes(term) || 
          category.includes(term) ||
          (skin.rarity && skin.rarity.toLowerCase().includes(term)) ||
          (skin.collection?.name && skin.collection.name.toLowerCase().includes(term))
        );
      });
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
 * Pesquisa melhorada para encontrar termos parciais
 */
export const searchSkins = async (query: string): Promise<Skin[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const skins = await fetchSkins();
  const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);
  
  // Filtro melhorado: cada termo deve corresponder a pelo menos uma parte do nome completo
  return skins.filter(skin => {
    const fullName = `${skin.weapon || ""} ${skin.name || ""}`.toLowerCase();
    
    // Cada termo deve corresponder a alguma parte do nome
    return searchTerms.every(term => 
      fullName.includes(term) || 
      (skin.rarity && skin.rarity.toLowerCase().includes(term)) ||
      (skin.collection?.name && skin.collection.name.toLowerCase().includes(term))
    );
  });
};
