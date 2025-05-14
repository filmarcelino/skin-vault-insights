
export * from './inventory-service';
export * from './transactions-service';
export * from './value-service';

// Add a debug utility to help identify issues with inventory items
export const debugInventoryItem = (item: any, label = "Inventory Item") => {
  console.log(`[DEBUG] ${label}:`, {
    id: item.id,
    name: item.name,
    isInUserInventory: item.isInUserInventory,
    inventoryId: item.inventoryId || item.inventory_id || null,
    acquiredDate: item.acquiredDate || item.acquired_date || null
  });
};
