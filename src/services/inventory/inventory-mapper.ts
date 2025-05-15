
import { supabase } from "@/lib/supabase";
import { InventoryItem, Transaction } from "@/types/skin";

// Map database inventory item to frontend InventoryItem
export const mapInventoryItem = (item: any): InventoryItem => {
  return {
    id: item.id,
    inventoryId: item.inventory_id,
    name: item.name,
    weapon: item.weapon,
    image: item.image,
    rarity: item.rarity,
    price: item.price ? parseFloat(item.price) : 0,
    purchasePrice: item.purchase_price ? parseFloat(item.purchase_price) : 0,
    acquiredDate: item.acquired_date,
    tradeLockDays: item.trade_lock_days,
    tradeLockUntil: item.trade_lock_until,
    isStatTrak: item.is_stat_trak,
    notes: item.notes,
    userId: item.user_id,
    isInUserInventory: item.is_in_user_inventory,
    skin_id: item.skin_id,
    wear: item.wear,
    floatValue: item.float_value,
    fee_percentage: item.fee_percentage,
    marketplace: item.marketplace,
    currency: item.currency_code,
  };
};

// Map frontend InventoryItem to database format for insertion/update
export const mapToDbItem = (item: InventoryItem): any => {
  return {
    inventory_id: item.inventoryId,
    name: item.name,
    weapon: item.weapon,
    image: item.image,
    rarity: item.rarity,
    price: item.price,
    purchase_price: item.purchasePrice,
    acquired_date: item.acquiredDate,
    trade_lock_days: item.tradeLockDays,
    trade_lock_until: item.tradeLockUntil,
    is_stat_trak: item.isStatTrak,
    wear: item.wear,
    float_value: item.floatValue,
    notes: item.notes,
    is_in_user_inventory: item.isInUserInventory,
    skin_id: item.skin_id || item.id,
    marketplace: item.marketplace,
    fee_percentage: item.fee_percentage,
    currency_code: item.currency || "USD"
  };
};
