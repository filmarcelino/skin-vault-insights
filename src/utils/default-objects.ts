
import { InventoryItem, Skin } from "@/types/skin";

// Default skin object for new or empty skins
export const defaultSkin: Skin = {
  id: "",
  name: "",
  weapon: "",
  image: "",
  rarity: "Consumer Grade",
  price: 0,
  // Additional properties that are now part of Skin interface
  wear: "",
  isStatTrak: false,
  min_float: 0,
  max_float: 1,
};

// Default inventory item for new or empty inventory items
export const defaultInventoryItem: InventoryItem = {
  id: "",
  inventoryId: "",
  name: "",
  weapon: "",
  image: "",
  rarity: "Consumer Grade",
  price: 0,
  purchasePrice: 0,
  acquiredDate: new Date().toISOString(),
  isInUserInventory: true,
  isStatTrak: false,
  wear: "",
  floatValue: 0,
  tradeLockDays: 0,
  notes: "",
  // Snake case versions
  skin_id: "",
  skin_name: "",
  weapon_name: "",
  image_url: "",
  purchase_price: 0,
  acquired_date: new Date().toISOString(),
  is_in_user_inventory: true,
  float_value: 0,
  is_stat_trak: false,
  condition: "",
  marketplace: "Steam",
  fee_percentage: 0,
  currency: "USD",
};
