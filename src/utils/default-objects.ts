
import { Skin, InventoryItem } from "@/types/skin";

// Default empty skin object that satisfies the Skin interface requirements
export const defaultSkin: Skin = {
  id: "",
  name: "",
  weapon: "",
  rarity: "",
  wear: "",
  image: "",
  price: 0
};

// Default empty inventory item that satisfies the InventoryItem interface requirements
export const defaultInventoryItem: InventoryItem = {
  id: "",
  name: "",
  inventoryId: "",
  acquiredDate: new Date().toISOString(),
  isInUserInventory: true,
  weapon: "",
  rarity: "",
  wear: "",
  image: "",
  price: 0,
  purchasePrice: 0,
  currentPrice: 0,
  currency: "USD",
  isStatTrak: false,
  tradeLockDays: 0
};
