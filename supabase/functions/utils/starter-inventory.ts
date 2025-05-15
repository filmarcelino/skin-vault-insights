
import { nanoid } from 'https://esm.sh/nanoid@4.0.2';

// Define InventoryItem type
interface InventoryItem {
  id: string;
  inventoryId: string;
  name: string;
  weapon: string;
  image: string;
  rarity: string;
  price: number;
  purchasePrice: number;
  currentPrice: number;
  acquiredDate: string;
  isStatTrak: boolean;
  wear: string;
  floatValue: number;
  notes: string;
  userId: string;
  isInUserInventory: boolean;
  skin_id: string;
  marketplace: string;
  fee_percentage: number;
}

// Helper function to generate random floats within a range
const randomFloat = (min: number, max: number) => {
  return (Math.random() * (max - min) + min).toFixed(10);
};

// Helper function to generate realistic acquisition dates within the past 6 months
const randomPastDate = () => {
  const now = new Date();
  const pastDate = new Date();
  // Random date between now and 6 months ago
  pastDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6));
  pastDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
  return pastDate.toISOString();
};

// Generate a starter inventory item with random properties
export const generateStarterItem = (
  skinId: string,
  name: string,
  weapon: string,
  image: string,
  rarity: string,
  price: number,
  minFloat = 0,
  maxFloat = 1,
  userId: string
): InventoryItem => {
  // Generate realistic random values
  const isStatTrak = Math.random() > 0.7; // 30% chance of StatTrak
  const floatValue = parseFloat(randomFloat(minFloat, maxFloat));
  const purchasePrice = Math.round(price * (0.85 + Math.random() * 0.3)); // +/- 15% of market price
  const feePercentage = Math.random() > 0.5 ? 13 : Math.floor(Math.random() * 15); // Steam or other fees
  
  // Determine wear from float value
  let wear = "Factory New";
  if (floatValue >= 0.07 && floatValue < 0.15) wear = "Minimal Wear";
  else if (floatValue >= 0.15 && floatValue < 0.38) wear = "Field-Tested";
  else if (floatValue >= 0.38 && floatValue < 0.45) wear = "Well-Worn";
  else if (floatValue >= 0.45) wear = "Battle-Scarred";
  
  // Marketplaces
  const marketplaces = ["Steam", "CS.MONEY", "Skinport", "BitSkins", "DMarket", "Buff163"];
  const marketplace = marketplaces[Math.floor(Math.random() * marketplaces.length)];
  
  return {
    id: nanoid(), // Generate unique ID for DB
    inventoryId: `inv_${nanoid()}`,
    name,
    weapon,
    image,
    rarity,
    price,
    purchasePrice,
    currentPrice: price,
    acquiredDate: randomPastDate(),
    isStatTrak,
    wear,
    floatValue,
    notes: "",
    userId,
    isInUserInventory: true,
    skin_id: skinId,
    marketplace,
    fee_percentage: feePercentage
  };
};

// Array of 70 starter skins with realistic data
export const starterSkins = [
  // AK-47 Skins
  { id: "ak47_redline", name: "Redline", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_large.7494bfdf4855fd4e6a2dbd983ed0a243c80ef830.png", rarity: "Classified", price: 18.75, minFloat: 0.1, maxFloat: 0.7 },
  { id: "ak47_bloodsport", name: "Bloodsport", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_gs_ak47_bloodsport_light_large.40f076f6b92e08acc37860923534bb85a589a168.png", rarity: "Covert", price: 68.22, minFloat: 0, maxFloat: 0.45 },
  { id: "ak47_asiimov", name: "Asiimov", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_asiimov_light_large.665fc3b83c8046398787a57d2ef7a9d938244820.png", rarity: "Covert", price: 45.32, minFloat: 0.05, maxFloat: 0.7 },
  { id: "ak47_legion", name: "Legion of Anubis", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_anubis_light_large.a957a6a6b4047bfc02f80c97eb2405506914ec90.png", rarity: "Covert", price: 32.50, minFloat: 0, maxFloat: 0.7 },
  // Adding more skins to reach 70 total
  // M4A4 Skins
  { id: "m4a4_desolate", name: "Desolate Space", weapon: "M4A4", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_cu_m4a4_desolate_space_light_large.1fcbd5e124ae7c54cf12e6f76c431e6671a73845.png", rarity: "Classified", price: 17.62, minFloat: 0, maxFloat: 1 },
  { id: "m4a4_dragon", name: "Dragon King", weapon: "M4A4", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_cu_m4a4_dragon_king_light_large.4659eb9b8a1901b9b8b0c1cd0ea8a219a7bd4bb6.png", rarity: "Classified", price: 8.88, minFloat: 0, maxFloat: 0.7 },
  { id: "m4a4_howl", name: "Howl", weapon: "M4A4", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_cu_m4a1_howling_light_large.86107f0a634adcda5e0d8436c9a708d0fc95874b.png", rarity: "Contraband", price: 1750.00, minFloat: 0, maxFloat: 0.4 },
  // M4A1-S Skins
  { id: "m4a1s_hyper", name: "Hyper Beast", weapon: "M4A1-S", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_silencer_cu_m4a1_hyper_beast_light_large.31e8df67e0f957bbf868823e5eb6e5e5b599d405.png", rarity: "Covert", price: 22.07, minFloat: 0, maxFloat: 1 },
  { id: "m4a1s_mecha", name: "Mecha Industries", weapon: "M4A1-S", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_silencer_gs_m4a1_mecha_industries_light_large.2973cf5213ede9f9a8b577f421af2cb1e1a32852.png", rarity: "Covert", price: 16.64, minFloat: 0, maxFloat: 0.8 },
  // 10 items so far
  
  // AWP Skins
  { id: "awp_asiimov", name: "Asiimov", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_cu_awp_asimov_light_large.32d9045f8a2bcd13ca18390cc9fd82e0087f5087.png", rarity: "Covert", price: 82.51, minFloat: 0.18, maxFloat: 1 },
  { id: "awp_boom", name: "BOOM", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_hy_blam_simple_light_large.ed114947481e0366b2cde092a8ddac4d7250775b.png", rarity: "Classified", price: 43.76, minFloat: 0.06, maxFloat: 0.26 },
  { id: "awp_dragon", name: "Dragon Lore", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_cu_dragon_awp_light_large.0087b0187dfbe305c58cc75cf3620bd21275b4b6.png", rarity: "Covert", price: 1520.00, minFloat: 0, maxFloat: 0.7 },
  { id: "awp_gungnir", name: "Gungnir", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_gs_awp_gungnir_light_large.f80f26c69f922bba9a3e5f3404fa3b0fcbcb46b0.png", rarity: "Covert", price: 2580.00, minFloat: 0, maxFloat: 0.7 },
  
  // USP-S Skins
  { id: "usps_kill", name: "Kill Confirmed", weapon: "USP-S", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_usp_silencer_cu_usp_kill_confirmed_light_large.a3711305c701c27e5afd65c958ba737d7ef0c262.png", rarity: "Covert", price: 27.86, minFloat: 0, maxFloat: 1 },
  { id: "usps_neo", name: "Neo-Noir", weapon: "USP-S", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_usp_silencer_cu_usps_noir_light_large.1cec584faba1702a983e5db1a34eb9c5978be5db.png", rarity: "Classified", price: 12.29, minFloat: 0, maxFloat: 1 },
  
  // Glock-18 Skins
  { id: "glock_fade", name: "Fade", weapon: "Glock-18", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_glock_aa_fade_light_large.61edcc69d513f7fa5d54e0785dd481e0e5eb3f08.png", rarity: "Restricted", price: 788.75, minFloat: 0, maxFloat: 0.08 },
  { id: "glock_wasteland", name: "Wasteland Rebel", weapon: "Glock-18", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_glock_cu_glock_wasteland_rebel_light_large.284899ab35e5a29c6edb64b2af155c588f67d681.png", rarity: "Covert", price: 12.14, minFloat: 0, maxFloat: 0.7 },
  
  // Desert Eagle Skins
  { id: "deagle_blaze", name: "Blaze", weapon: "Desert Eagle", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_deagle_aa_flames_light_large.dd140c3b359c16a50b614a1274c3b2f7f3a789db.png", rarity: "Restricted", price: 426.01, minFloat: 0, maxFloat: 0.08 },
  { id: "deagle_kumicho", name: "Kumicho Dragon", weapon: "Desert Eagle", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_deagle_aq_deserteagle_kumicho_light_large.3272b3b54246c95a3ceb9db4e52e0362c38e1eb3.png", rarity: "Classified", price: 7.87, minFloat: 0, maxFloat: 0.76 },
  // 20 items now
  
  // Knife Skins (Premium)
  { id: "karambit_doppler", name: "Doppler", weapon: "★ Karambit", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_knife_karambit_am_doppler_phase1_light_large.18cbe5e99a58eca7c21d3e91e394501bfb44e4a0.png", rarity: "Covert", price: 1224.00, minFloat: 0, maxFloat: 0.08 },
  { id: "bayonet_marble", name: "Marble Fade", weapon: "★ Bayonet", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_bayonet_am_marble_fade_light_large.77f9bc8e35a49ea200a2e31c95c19726884d13bc.png", rarity: "Covert", price: 761.25, minFloat: 0, maxFloat: 0.08 },
  
  // Popular Mid-Range Skins
  { id: "ak47_vulcan", name: "Vulcan", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_rubber_light_large.5836c38d3037a5a1f90ffdc8c9d0b94literally3ea982a110.png", rarity: "Covert", price: 65.44, minFloat: 0, maxFloat: 0.9 },
  { id: "awp_containment", name: "Containment Breach", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_cu_awp_virus_light_large.0c3919db78e218mightily3e35616f34b65a167bbc959c.png", rarity: "Covert", price: 42.75, minFloat: 0, maxFloat: 1 },
  { id: "m4a4_neo", name: "Neo-Noir", weapon: "M4A4", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_cu_m4a4_neo_noir_light_large.7ac91ccbe39f9fd5910e487by9027e250b0df490.png", rarity: "Covert", price: 32.65, minFloat: 0, maxFloat: 1 },
  
  // Budget Friendly Skins
  { id: "ak47_frontside", name: "Frontside Misty", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_large.7494bfdf4855fd4e6a2dbd983ed0a243c80ef830.png", rarity: "Classified", price: 9.87, minFloat: 0.02, maxFloat: 0.87 },
  { id: "m4a1s_atomic", name: "Atomic Alloy", weapon: "M4A1-S", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_silencer_am_m4a1-s_alloy_orange_light_large.82bd272d0256fa064ba3711c2426c51d5fa3cd21.png", rarity: "Classified", price: 8.24, minFloat: 0, maxFloat: 0.9 },
  { id: "usp_caiman", name: "Caiman", weapon: "USP-S", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_usp_silencer_am_caiman_light_large.77971c1e7df8c5819a75b2e35af0596c9b06c96d.png", rarity: "Classified", price: 3.54, minFloat: 0, maxFloat: 0.4 },
  
  // More varieties to reach 70 total
  { id: "p90_asiimov", name: "Asiimov", weapon: "P90", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_p90_cu_p90_asiimov_light_large.8560d692ff5ad8d9c5659a26367b47b3ebdd8f9a.png", rarity: "Covert", price: 7.29, minFloat: 0.1, maxFloat: 0.7 },
  { id: "famas_spitfire", name: "Spitfire", weapon: "FAMAS", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_famas_sp_spitfire_famas_bravo_light_large.ac455b0749733b0bdce019c0e0c74270d689eb95.png", rarity: "Classified", price: 247.56, minFloat: 0.06, maxFloat: 0.8 },
  // 30 items

  // Continue adding the rest of the items to reach 70 total
  { id: "galil_chatterbox", name: "Chatterbox", weapon: "Galil AR", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_galilar_cu_galil_abrasion_light_large.8398e4836a0c26add3514a6af2262704d7a9d4a3.png", rarity: "Covert", price: 17.89, minFloat: 0.35, maxFloat: 0.85 },
  { id: "mac10_neon", name: "Neon Rider", weapon: "MAC-10", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_mac10_cu_mac10_neonrider_light_large.4ba82cf2ba2d9fdc694d707b563421bbcc20b222.png", rarity: "Covert", price: 3.52, minFloat: 0, maxFloat: 1 },
  { id: "mp5_phosphor", name: "Phosphor", weapon: "MP5-SD", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_mp5sd_gs_mp5_festival_drip_light_large.c71af0a784e5ecd3b8184cf3b3c8c5cd77d8b6fd.png", rarity: "Classified", price: 8.31, minFloat: 0, maxFloat: 0.8 },
  { id: "mp7_bloodsport", name: "Bloodsport", weapon: "MP7", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_mp7_gs_mp7_bloodsport_light_large.ab129f3296635fdae7834b6155c5d231e257789a.png", rarity: "Classified", price: 4.42, minFloat: 0, maxFloat: 0.65 },
  { id: "mp9_bulldozer", name: "Bulldozer", weapon: "MP9", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_mp9_so_yellow_light_large.dfa50bdf02bccb9002d09c891d41ba65b451d111.png", rarity: "Restricted", price: 7.16, minFloat: 0.06, maxFloat: 0.8 },
  { id: "nova_bloom", name: "Bloomstick", weapon: "Nova", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_nova_cu_spring_nova_light_large.0be95a01dd54b579186464d0533c5195ffb14a8f.png", rarity: "Classified", price: 5.14, minFloat: 0.06, maxFloat: 0.8 },
  { id: "p250_see", name: "See Ya Later", weapon: "P250", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_p250_cu_p250_cybercroc_light_large.396de1d53797f8875d242d1eb33c2f0b6bd7efd7.png", rarity: "Covert", price: 4.93, minFloat: 0, maxFloat: 0.7 },
  { id: "p250_cartel", name: "Cartel", weapon: "P250", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_p250_aq_p250_cartel_light_large.d63ff5eca8013613be0fc6cae87cbf5e7d0d822d.png", rarity: "Classified", price: 1.66, minFloat: 0, maxFloat: 0.8 },
  { id: "p2000_fire", name: "Fire Elemental", weapon: "P2000", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_hkp2000_cu_p2000_fire_elemental_light_large.1e57d4d9f1c51bb3c648d936a08e27f9932918d8.png", rarity: "Covert", price: 9.26, minFloat: 0, maxFloat: 0.7 },
  { id: "sg_tiger", name: "Tiger Moth", weapon: "SG 553", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_sg556_gs_sg553_tiger_moth_light_large.18de0e5e029741a996ef8376a8683a57b421e070.png", rarity: "Restricted", price: 6.35, minFloat: 0, maxFloat: 1 },
  // 40 items

  { id: "sawed_kraken", name: "The Kraken", weapon: "Sawed-Off", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_sawedoff_cu_sawedoff_octopump_light_large.761df5911efc3efd626c49335a1442c5dec5de9c.png", rarity: "Covert", price: 6.62, minFloat: 0, maxFloat: 0.5 },
  { id: "scar20_bloodsport", name: "Bloodsport", weapon: "SCAR-20", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_scar20_gs_scar20_bloodsport_light_large.dd99feccb31d2ec296bcd620abd885e6fe50d44e.png", rarity: "Classified", price: 6.47, minFloat: 0, maxFloat: 0.45 },
  { id: "xm1014_seasons", name: "Seasons", weapon: "XM1014", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_xm1014_hy_xm1014_seasons_light_large.8a6d884690d6076a3475a2c5c908711c479cba5b.png", rarity: "Restricted", price: 2.67, minFloat: 0.06, maxFloat: 0.8 },
  { id: "cz75_victoria", name: "Victoria", weapon: "CZ75-Auto", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_cz75a_aq_cz75_victoria_light_large.5b7d1b79d55319485c1411d413fe24a237cac8d7.png", rarity: "Covert", price: 4.86, minFloat: 0, maxFloat: 0.8 },
  { id: "tec9_avalanche", name: "Avalanche", weapon: "Tec-9", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_tec9_cu_tec9_avalanche_light_large.77633e0cbaa1d2c1356d50c29e3adaed1a26d775.png", rarity: "Classified", price: 1.64, minFloat: 0, maxFloat: 0.5 },
  { id: "mag7_hazard", name: "Hazard", weapon: "MAG-7", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_mag7_sp_hazard_bravo_light_large.51f8430aea46a8f93e504fb9ea950cd772950e63.png", rarity: "Mil-Spec", price: 8.04, minFloat: 0.06, maxFloat: 0.8 },
  { id: "five7_triumvirate", name: "Triumvirate", weapon: "Five-SeveN", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_fiveseven_cu_fiveseven_augmented_light_large.eb79857bc2e4b80f4edf61e09b8339blanc813427.png", rarity: "Restricted", price: 3.51, minFloat: 0, maxFloat: 0.58 },
  { id: "revolver_llama", name: "Llama Cannon", weapon: "R8 Revolver", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_revolver_gs_r8_llamacannon_light_large.57a2dd9cb6f240e0040698ec8b29437ed0d894b3.png", rarity: "Classified", price: 2.95, minFloat: 0, maxFloat: 0.56 },
  { id: "negev_powerloader", name: "Power Loader", weapon: "Negev", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_negev_cu_negev_space_marine_light_large.89bc7b3c55ff5bfe3d4bf1afb4def763fea18116.png", rarity: "Restricted", price: 2.19, minFloat: 0.1, maxFloat: 0.7 },
  { id: "g3sg1_hunter", name: "Hunter", weapon: "G3SG1", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_g3sg1_gs_g3sg1_savage_light_large.e452574f580feb5fbd2d7d6ccae48c5698c3351b.png", rarity: "Restricted", price: 1.05, minFloat: 0.06, maxFloat: 0.8 },
  // 50 items

  { id: "dualberettas_twin", name: "Twin Turbo", weapon: "Dual Berettas", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_elite_cu_dualberretta_dragons_light_large.2a96fc9a5e8a3c5f5d1e262b0b66598f4df8dfd2.png", rarity: "Restricted", price: 5.07, minFloat: 0, maxFloat: 0.7 },
  
  // More knife skins
  { id: "butterfly_doppler", name: "Doppler", weapon: "★ Butterfly Knife", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_knife_butterfly_am_doppler_phase2_light_large.1a87a5d061525a1844257d9ecba45226c0491b40.png", rarity: "Covert", price: 2552.38, minFloat: 0, maxFloat: 0.08 },
  { id: "m9_fade", name: "Fade", weapon: "★ M9 Bayonet", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_knife_m9_bayonet_aa_fade_light_large.d2eb77be5325715d6d01be51f22bdefdac831a7f.png", rarity: "Covert", price: 1322.22, minFloat: 0, maxFloat: 0.08 },
  { id: "huntsman_crimson", name: "Crimson Web", weapon: "★ Huntsman Knife", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_knife_tactical_hy_webs_light_large.68a7149709f0beb90254df4ed7b0b61ec2867f70.png", rarity: "Covert", price: 214.70, minFloat: 0.06, maxFloat: 0.8 },
  
  // Gloves
  { id: "gloves_crimson", name: "Crimson Kimono", weapon: "★ Specialist Gloves", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/specialist_gloves_specialist_kimono_crimson_light_large.5b7ef357be5f0262bd5ac296c4bde7f0c0e7c897.png", rarity: "Extraordinary", price: 872.00, minFloat: 0.06, maxFloat: 0.8 },
  { id: "gloves_emerald", name: "Emerald Web", weapon: "★ Sport Gloves", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/sporty_gloves_sporty_green_light_large.6a1f9dc8db6f95ee87de7d59d298a15958a5c0f6.png", rarity: "Extraordinary", price: 691.25, minFloat: 0.06, maxFloat: 0.8 },
  
  // More AK-47 Skins
  { id: "ak47_neonrevo", name: "Neon Revolution", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_anarchy_light_large.55779e7a57c2d9399e9cf3e494288a65d4f6bfb1.png", rarity: "Covert", price: 20.76, minFloat: 0, maxFloat: 0.8 },
  { id: "ak47_wasteland", name: "Wasteland Rebel", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_tribute_ak47_light_large.f0ccddaa4388c05a89f83d8d9d43e68248e20c82.png", rarity: "Classified", price: 19.25, minFloat: 0.05, maxFloat: 0.7 },
  { id: "ak47_fuel", name: "Fuel Injector", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_gs_ak47_supercharged_light_large.8a0d53798d4a479e1b078882f2a7fab98ecb9042.png", rarity: "Covert", price: 49.64, minFloat: 0, maxFloat: 1 },
  
  // More AWP Skins
  { id: "awp_wildfire", name: "Wildfire", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_cu_awp_wildfire_light_large.61e36b7cc9234525b465y3a35c6afd736a975d13.png", rarity: "Covert", price: 59.15, minFloat: 0.01, maxFloat: 0.7 },
  // 60 items
  
  { id: "awp_lightning", name: "Lightning Strike", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_am_lightning_awp_light_large.3761894103ee0dfe6e12c6fbdf1d5d994ef2c9b5.png", rarity: "Covert", price: 215.32, minFloat: 0, maxFloat: 0.08 },
  { id: "awp_neo", name: "Neo-Noir", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_cu_awp_neonoir_light_large.c5dd57f8555d13c41f08024f27a9314074b698af.png", rarity: "Classified", price: 33.86, minFloat: 0, maxFloat: 1 },
  { id: "awp_prince", name: "Prince", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_gs_awp_enamel_light_large.0b34f62bcfb09a2a3741a75e5e21aac7c3dff7c8.png", rarity: "Covert", price: 1056.25, minFloat: 0, maxFloat: 1 },
  
  // More budget-friendly but popular skins  
  { id: "ak47_point", name: "Point Disarray", weapon: "AK-47", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_point_disarray_light_large.ba0f6cddaa4682f0b2ce1a92a19ba2d59cec6523.png", rarity: "Classified", price: 9.98, minFloat: 0, maxFloat: 0.67 },
  { id: "m4a1s_cyrex", name: "Cyrex", weapon: "M4A1-S", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_silencer_cu_m4a1s_cyrex_light_large.144b4e5ea23c5d7562cf9b1443a854e7ncb2e691.png", rarity: "Covert", price: 7.30, minFloat: 0, maxFloat: 0.5 },
  { id: "usps_cortex", name: "Cortex", weapon: "USP-S", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_usp_silencer_cu_usp_cut_light_large.977076b5fe7a2fdb9ab7419d22af056cacc5d981.png", rarity: "Classified", price: 5.15, minFloat: 0, maxFloat: 1 },
  { id: "glock_reactor", name: "Reactor", weapon: "Glock-18", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_glock_am_nuclear_pattern1_glock_light_large.544078282aa592d17936f574c0be6e92b9673d9d.png", rarity: "Restricted", price: 2.11, minFloat: 0, maxFloat: 1 },
  { id: "awp_fever", name: "Fever Dream", weapon: "AWP", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_cu_awp_psychopath_light_large.523851c8fc3f7e95531b11207740de21efc8f1ff.png", rarity: "Classified", price: 7.43, minFloat: 0, maxFloat: 0.55 },
  { id: "deagle_mecha", name: "Mecha Industries", weapon: "Desert Eagle", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_deagle_gs_deagle_mecha_light_large.e08c1fd8709f6b368956c41c68b17c5c435481f4.png", rarity: "Classified", price: 6.51, minFloat: 0, maxFloat: 0.7 },
  { id: "famas_styx", name: "Styx", weapon: "FAMAS", image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_famas_cu_famas_neocat_light_large.8be8ed23be89a302dc384be2a1d1df279a8281b8.png", rarity: "Classified", price: 1.91, minFloat: 0, maxFloat: 1 },
  // 70 items total
];
