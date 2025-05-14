
import { Skin, InventoryItem } from "@/types/skin";

// Default empty skin object that satisfies the Skin interface requirements
export const defaultSkin: Skin = {
  id: "",
  name: "",
};

// Default empty inventory item that satisfies the InventoryItem interface requirements
export const defaultInventoryItem: InventoryItem = {
  id: "",
  name: "",
  inventoryId: "",
  acquiredDate: new Date().toISOString(),
  isInUserInventory: false
};
