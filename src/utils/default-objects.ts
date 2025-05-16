
import { Skin, InventoryItem } from "@/types/skin";

// Default skin object to use as a fallback
export const defaultSkin: Skin = {
  id: "default",
  name: "Default Skin",
  weapon: "Unknown",
  image: "/placeholder-skin.png",
  rarity: "Consumer Grade",
  price: 0,
  category: "Normal",
  type: "Normal",
  wear: "Factory New",
  collections: [],
  purchasePrice: 0,
  inventoryId: "",
  isInUserInventory: false,
  marketplace: "Steam Market",
  feePercentage: 15,
  notes: "",
  isStatTrak: false
};

// Default inventory item to use as a fallback
export const defaultInventoryItem: InventoryItem = {
  id: "default",
  inventoryId: "default",
  name: "Default Skin",
  weapon: "Unknown",
  image: "/placeholder-skin.png",
  rarity: "Consumer Grade",
  price: 0,
  purchasePrice: 0,
  acquiredDate: new Date().toISOString(),
  isInUserInventory: false,
  category: "Normal",
  sellMode: false,
  isStatTrak: false,
  wear: "Factory New",
  marketplace: "Steam Market",
  feePercentage: 15,
  floatValue: undefined,
  notes: ""
};

// Default transaction object to use as a fallback
export const defaultTransaction = {
  id: "default",
  type: "add" as "add" | "sell" | "trade" | "buy", 
  itemId: "default",
  skinName: "Default Skin",
  weaponName: "Unknown",
  price: 0,
  date: new Date().toISOString(),
  userId: "",
  currency: "USD"
};
