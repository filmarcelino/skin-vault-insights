
import { Skin, SkinCollection } from "@/types/skin";

// This file would contain local JSON data as fallback
// In a real app, you'd import actual JSON files
// For this example, we'll use a small sample dataset

export const localWeapons: string[] = [
  "AK-47", "M4A4", "M4A1-S", "AWP", "Desert Eagle", "USP-S", "Glock-18", "Karambit"
];

export const localCollections: SkinCollection[] = [
  {
    id: "ancient",
    name: "The Ancient Collection",
    description: "Introduced in Operation Broken Fang",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQwnfCcJmxDv9rhwIHZwqP3a-uGwz9Xv8F0j-qQrYj23FHm-UJqY2zwIYedc1Q9MwnU8gO_xr3ogIj84sr6NM-EHA"
  },
  {
    id: "dreams-nightmares",
    name: "Dreams & Nightmares",
    description: "Dreams & Nightmares Collection",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQxnaecIT8Wv9rilYTYkfTyNuiFwmhUvpZz3-2Z9oqgjVfjqUI4ZGjwJIaQdFVoNFzU_1W7k7_thZe4uJvXiSw0K4XkrHs"
  }
];

export const localSkins: Skin[] = [
  {
    id: "awp-neo-noir",
    name: "Neo-Noir",
    weapon: "AWP",
    category: "Sniper Rifle",
    rarity: "Covert",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G9SupUijOjAotyg3w2x_0ZkZ2rzd4OXdgRoYQuE8gDtyL_mg5K4tJ7XiSw0WqKv8kM"
  },
  {
    id: "ak-47-vulcan",
    name: "Vulcan",
    weapon: "AK-47",
    category: "Rifle",
    rarity: "Covert",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjQO3-UdsZGHyd4_Cd1I2YQvX-wm9xrjvgpW1uZjNmyc3pGB8spM9TGbUn"
  },
  {
    id: "karambit-doppler",
    name: "Doppler",
    weapon: "Karambit",
    category: "Knife",
    rarity: "Covert",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij7v--YXygED6-kE4N2CgddSQJAE7ZFnSrFO7kry6gZO7u8jByXtj6CkjsHzVzRe10wYMMLIHxiLN2w"
  },
  {
    id: "m4a4-desolate-space",
    name: "Desolate Space",
    weapon: "M4A4",
    category: "Rifle",
    rarity: "Classified",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJQJD_9W7m4WYg-X6N4Tdn2xZ_Pp9i_vG8MKsi1Cw-0E_N22iI4KVJAY2aAvW-VLrx-m-15TovJvLmydqvyRw5X7ZgVXp1tZS8s4y"
  }
];

// Functions that mimic the API but return local data
export const getLocalWeapons = (): Promise<string[]> => {
  return Promise.resolve(localWeapons);
};

export const getLocalCollections = (): Promise<SkinCollection[]> => {
  return Promise.resolve(localCollections);
};

export const getLocalSkins = (query?: string): Promise<Skin[]> => {
  if (!query) return Promise.resolve(localSkins);
  
  const lowerQuery = query.toLowerCase();
  const filtered = localSkins.filter(
    skin => skin.name.toLowerCase().includes(lowerQuery) || 
            skin.weapon?.toLowerCase().includes(lowerQuery)
  );
  
  return Promise.resolve(filtered);
};

export const getLocalSkinById = (id: string): Promise<Skin | null> => {
  const skin = localSkins.find(skin => skin.id === id);
  return Promise.resolve(skin || null);
};
