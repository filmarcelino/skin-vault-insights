
import { InventoryItem, Transaction } from "@/types/skin";

export const mapSupabaseToInventoryItem = (item: any): InventoryItem | null => {
  if (!item) return null;
  
  try {
    const mappedItem: InventoryItem = {
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
      // This is the critical property - make sure it's always defined
      isInUserInventory: item.is_in_user_inventory !== false // Convert any value to a valid boolean, default to true
    };
    
    console.log(`Mapped item ${mappedItem.name} with isInUserInventory:`, mappedItem.isInUserInventory);
    
    return mappedItem;
  } catch (error) {
    console.error("Error mapping inventory item:", error);
    return null;
  }
};

export const mapSupabaseToTransaction = (transaction: any): Transaction | null => {
  if (!transaction) return null;
  
  try {
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
  } catch (error) {
    console.error("Error mapping transaction:", error);
    return null;
  }
};
