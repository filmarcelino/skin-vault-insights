
export * from './inventory-service';
export * from './transactions-service';
export * from './value-service';

// Add a debug utility to help identify issues with inventory items
export const debugInventoryItem = (item: any, label = "Inventory Item") => {
  if (!item) {
    console.log(`[DEBUG] ${label}: null or undefined item`);
    return;
  }
  
  console.log(`[DEBUG] ${label}:`, {
    id: item.id,
    name: item.name,
    isInUserInventory: item.isInUserInventory,
    inventoryId: item.inventoryId || item.inventory_id || null,
    acquiredDate: item.acquiredDate || item.acquired_date || null,
    raw_is_in_user_inventory: item.is_in_user_inventory,
    allKeys: Object.keys(item)
  });
};

// Utility functions for type safety
export const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const safeBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 1 || value === '1') return true;
  return false;
};

export const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};
