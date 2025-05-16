
import { InventoryItem, Transaction } from "@/types/skin";

/**
 * Maps a Supabase database row to an InventoryItem
 */
export const mapSupabaseToInventoryItem = (item: any): InventoryItem => {
  if (!item) return null;
  
  return {
    id: item.skin_id || "",
    inventoryId: item.inventory_id || `inv_${Math.random().toString(36).slice(2, 11)}`,
    name: item.name || "",
    weapon: item.weapon || "",
    image: item.image || "",
    rarity: item.rarity || "Consumer Grade",
    price: parseFloat(item.price) || 0,
    purchasePrice: parseFloat(item.purchase_price) || 0,
    acquiredDate: item.acquired_date || new Date().toISOString(),
    isStatTrak: !!item.is_stat_trak,
    wear: item.wear || "Factory New",
    floatValue: parseFloat(item.float_value) || 0,
    notes: item.notes || "",
    userId: item.user_id || "",
    isInUserInventory: !!item.is_in_user_inventory,
    marketplace: item.marketplace || "Steam Market",
    feePercentage: item.fee_percentage || 13,
    tradeLockDays: item.trade_lock_days || 0,
    tradeLockUntil: item.trade_lock_until || null,
    category: item.category || "Normal",
    type: item.type || "Normal"
  };
};

/**
 * Maps a Supabase database row to a Transaction
 */
export const mapSupabaseToTransaction = (item: any): Transaction => {
  if (!item) return null;
  
  return {
    id: item.transaction_id || item.id || "",
    type: item.type as "add" | "sell" | "trade" | "buy",
    weaponName: item.weapon_name || "",
    skinName: item.skin_name || "",
    date: item.date || new Date().toISOString(),
    price: parseFloat(item.price) || 0,
    notes: item.notes || "",
    itemId: item.item_id || "",
    currency: item.currency_code || "USD",
    userId: item.user_id || "",
    marketplace: item.marketplace || "Unknown"
  };
};
