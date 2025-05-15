
// Update imports to include necessary types
import { Skin, SkinCollection } from "@/types/skin";

// Placeholder data for Local development mode
const localWeapons = ["AK-47", "M4A4", "AWP", "Desert Eagle", "USP-S"];

const localCollections = [
  { id: "c1", name: "Danger Zone Collection", description: "From Danger Zone update", image: "" },
  { id: "c2", name: "Cobblestone Collection", description: "From Cobblestone map", image: "" },
  { id: "c3", name: "Ancient Collection", description: "From Ancient map", image: "" },
  { id: "c4", name: "Dust 2 Collection", description: "From Dust II map", image: "" },
];

const localSkins: Skin[] = [
  {
    id: "skin_1",
    name: "Asiimov",
    weapon: "AWP",
    category: "Sniper Rifle",
    rarity: "Covert",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_cu_awp_asimov_light_large.32d9045f8a2bcd13ca18390cc9fd82026e7195ab.png",
    price: 120, // Added price
  },
  {
    id: "skin_2",
    name: "Vulcan",
    weapon: "AK-47",
    category: "Rifle",
    rarity: "Covert",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_rubber_light_large.0db5a5503d3bbe3a1e62a0382fe3eed3afca9b2e.png",
    price: 85, // Added price
  },
  {
    id: "skin_3",
    name: "Hyper Beast",
    weapon: "M4A1-S",
    category: "Rifle",
    rarity: "Covert",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_silencer_cu_m4a1s_hyper_beast_light_large.31850937661935a062d5f6faf5a1f02fca58c36a.png",
    price: 60, // Added price
  },
  {
    id: "skin_4",
    name: "Neo-Noir",
    weapon: "USP-S",
    category: "Pistol",
    rarity: "Classified",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_usp_silencer_cu_usps_noir_light_large.ed0f4245c1b9031c6d410300ce6fb7ce3ff9a44d.png",
    price: 25, // Added price
  },
  // You can add more skins here if needed
];

// Helper functions for fetching local data
export const getLocalWeapons = () => {
  return localWeapons;
};

export const getLocalCollections = () => {
  return localCollections;
};

export const getLocalSkins = (search?: string) => {
  if (!search) return localSkins;
  
  const searchLower = search.toLowerCase();
  return localSkins.filter(skin => 
    skin.name.toLowerCase().includes(searchLower) || 
    skin.weapon.toLowerCase().includes(searchLower)
  );
};

export const getLocalSkinById = (id: string) => {
  return localSkins.find(skin => skin.id === id) || null;
};
