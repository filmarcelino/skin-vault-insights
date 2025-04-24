
import { InventoryItem, Skin, Transaction } from "@/types/skin";

// Helper function to convert Supabase inventory items to our app's model
export const mapSupabaseToInventoryItem = (item: any): InventoryItem => {
  if (!item) return null;
  
  return {
    id: item.skin_id || '',
    inventoryId: item.inventory_id || '',
    name: item.name || '',
    weapon: item.weapon || '',
    rarity: item.rarity,
    wear: item.wear,
    image: item.image,
    price: item.price,
    purchasePrice: item.purchase_price,
    currentPrice: item.current_price,
    acquiredDate: item.acquired_date || new Date().toISOString(),
    isStatTrak: item.is_stat_trak || false,
    tradeLockDays: item.trade_lock_days,
    tradeLockUntil: item.trade_lock_until,
    marketplace: item.marketplace,
    feePercentage: item.fee_percentage,
    floatValue: item.float_value,
    notes: item.notes,
    currency: item.currency_code || "USD",
    collection: item.collection_name ? {
      id: item.collection_id,
      name: item.collection_name
    } : undefined,
    isInUserInventory: true
  };
};

// Helper function to convert Supabase transactions to our app's model
export const mapSupabaseToTransaction = (transaction: any): Transaction => {
  if (!transaction) return null;
  
  return {
    id: transaction.transaction_id || '',
    type: transaction.type || 'add',
    itemId: transaction.item_id || '',
    weaponName: transaction.weapon_name || '',
    skinName: transaction.skin_name || '',
    date: transaction.date || new Date().toISOString(),
    price: transaction.price,
    notes: transaction.notes,
    currency: transaction.currency_code || "USD"
  };
};
