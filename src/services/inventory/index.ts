
// Re-export all functions from inventory service for easier imports
export {
  fetchUserInventory,
  addSkinToInventory,
  updateInventoryItem,
  removeInventoryItem,
  markItemAsSold,
  fetchSoldItems,
  getUserTransactions as fetchTransactions, 
  getCurrentDateAsString
} from './inventory-service';

// Re-export transaction-related functions
export {
  addTransaction,
} from './transactions-service';

// Export utility functions for value calculation
export const calculateItemValue = (item: any) => {
  // Simple implementation for now
  return item.price || item.purchasePrice || 0;
};

export const calculateCollectionValue = (items: any[]) => {
  // Simple implementation for now
  return items.reduce((total, item) => total + (item.price || item.purchasePrice || 0), 0);
};

// Add this simple function for inventory stats
export const calculateInventoryStats = (items: any[]) => {
  if (!Array.isArray(items)) return { totalItems: 0, totalValue: 0, averageValue: 0 };
  
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.price || item.purchasePrice || 0), 0);
  const averageValue = totalItems > 0 ? totalValue / totalItems : 0;
  
  return {
    totalItems,
    totalValue,
    averageValue
  };
};
