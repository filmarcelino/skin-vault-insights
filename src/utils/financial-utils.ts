
import { Transaction, InventoryItem } from "@/types/skin";
import { safeNumber } from "@/services/inventory";

/**
 * Calculate the total value of inventory items
 */
export const calculateInventoryValue = (items: InventoryItem[]): number => {
  return items.reduce((sum, item) => {
    // Use current_price if available, otherwise fallback to price or purchase_price
    const itemValue = safeNumber(item.currentPrice || item.price || item.purchasePrice || 0);
    return sum + itemValue;
  }, 0);
};

/**
 * Calculate profit/loss for transactions
 */
export const calculateProfitLoss = (transactions: Transaction[]): { profit: number; loss: number } => {
  let profit = 0;
  let loss = 0;
  
  // Create a map of purchase prices by item ID
  const purchasePrices: Record<string, number> = {};
  
  // First, get all purchase prices from 'add' transactions
  transactions.forEach(transaction => {
    if (transaction.type === 'add' && transaction.itemId) {
      purchasePrices[transaction.itemId] = safeNumber(transaction.price);
    }
  });
  
  // Calculate profit/loss for 'sell' transactions
  transactions.forEach(transaction => {
    if (transaction.type === 'sell' && transaction.itemId) {
      const purchasePrice = purchasePrices[transaction.itemId] || 0;
      const sellPrice = safeNumber(transaction.price);
      
      if (sellPrice > purchasePrice) {
        profit += (sellPrice - purchasePrice);
      } else if (sellPrice < purchasePrice) {
        loss += (purchasePrice - sellPrice);
      }
    }
  });
  
  return { profit, loss };
};

/**
 * Format currency value with symbol
 */
export const formatCurrency = (value: number, currencyCode: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currencyCode 
    }).format(value);
  } catch (error) {
    // Fallback to basic formatting if currency code is invalid
    return `${currencyCode} ${value.toFixed(2)}`;
  }
};

/**
 * Get transaction statistics
 */
export const getTransactionStats = (transactions: Transaction[]): {
  adds: number;
  sells: number;
  removes: number;
  totalValue: number;
} => {
  let adds = 0;
  let sells = 0;
  let removes = 0;
  let totalValue = 0;
  
  transactions.forEach(transaction => {
    const price = safeNumber(transaction.price);
    
    switch (transaction.type) {
      case 'add':
      case 'purchase':
        adds++;
        totalValue += price;
        break;
      case 'sell':
        sells++;
        break;
      case 'remove':
        removes++;
        break;
      default:
        break;
    }
  });
  
  return { adds, sells, removes, totalValue };
};
