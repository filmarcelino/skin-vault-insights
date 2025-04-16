
import { InventoryItem, Skin, Transaction } from "@/types/skin";

// Use local storage to persist inventory between sessions
const INVENTORY_STORAGE_KEY = "user_inventory";
const TRANSACTIONS_STORAGE_KEY = "user_transactions";

// Get user inventory from local storage
export const getUserInventory = (): InventoryItem[] => {
  const storedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
  return storedInventory ? JSON.parse(storedInventory) : [];
};

// Save user inventory to local storage
export const saveUserInventory = (inventory: InventoryItem[]): void => {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
};

// Add a skin to user's inventory
export const addSkinToInventory = (skin: Skin, purchaseInfo: {
  purchasePrice: number;
  marketplace: string;
  feePercentage?: number;
  notes?: string;
}): InventoryItem => {
  const inventory = getUserInventory();
  
  const inventoryItem: InventoryItem = {
    ...skin,
    inventoryId: `inv-${Date.now()}-${skin.id}`,
    acquiredDate: new Date().toISOString(),
    purchasePrice: purchaseInfo.purchasePrice,
    currentPrice: skin.price,
    marketplace: purchaseInfo.marketplace,
    feePercentage: purchaseInfo.feePercentage || 0,
    notes: purchaseInfo.notes || "",
    isInUserInventory: true,
    tradeLockDays: Math.floor(Math.random() * 8), // Random trade lock for demo
    tradeLockUntil: new Date(new Date().getTime() + Math.floor(Math.random() * 8) * 24 * 60 * 60 * 1000).toISOString()
  };
  
  inventory.push(inventoryItem);
  saveUserInventory(inventory);
  
  // Add transaction
  addTransaction({
    id: `trans-${Date.now()}`,
    type: 'add',
    itemId: inventoryItem.inventoryId,
    weaponName: inventoryItem.weapon || "Unknown",
    skinName: inventoryItem.name,
    date: new Date().toLocaleDateString(),
    price: purchaseInfo.purchasePrice,
    notes: purchaseInfo.notes
  });
  
  return inventoryItem;
};

// Remove a skin from user's inventory
export const removeSkinFromInventory = (inventoryId: string): void => {
  const inventory = getUserInventory();
  const updatedInventory = inventory.filter(item => item.inventoryId !== inventoryId);
  saveUserInventory(updatedInventory);
};

// Update a skin in user's inventory
export const updateInventoryItem = (updatedItem: InventoryItem): void => {
  const inventory = getUserInventory();
  const index = inventory.findIndex(item => item.inventoryId === updatedItem.inventoryId);
  
  if (index !== -1) {
    inventory[index] = updatedItem;
    saveUserInventory(inventory);
  }
};

// Get all user transactions
export const getUserTransactions = (): Transaction[] => {
  const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
  return storedTransactions ? JSON.parse(storedTransactions) : [];
};

// Save transactions to local storage
export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
};

// Add a new transaction
export const addTransaction = (transaction: Transaction): void => {
  const transactions = getUserTransactions();
  transactions.push(transaction);
  saveTransactions(transactions);
};

// Sell a skin and record the transaction
export const sellSkin = (inventoryId: string, sellData: {
  soldPrice: number;
  soldMarketplace: string;
  soldFeePercentage: number;
  soldNotes?: string;
}): void => {
  const inventory = getUserInventory();
  const skinIndex = inventory.findIndex(item => item.inventoryId === inventoryId);
  
  if (skinIndex !== -1) {
    const skin = inventory[skinIndex];
    
    // Remove from inventory
    inventory.splice(skinIndex, 1);
    saveUserInventory(inventory);
    
    // Add transaction
    addTransaction({
      id: `trans-${Date.now()}`,
      type: 'sell',
      itemId: inventoryId,
      weaponName: skin.weapon || "Unknown",
      skinName: skin.name,
      date: new Date().toLocaleDateString(),
      price: sellData.soldPrice,
      notes: sellData.soldNotes
    });
  }
};

// Calculate total inventory value
export const calculateInventoryValue = (): number => {
  const inventory = getUserInventory();
  return inventory.reduce((total, item) => {
    return total + (item.currentPrice || item.price || 0);
  }, 0);
};

// Find most valuable skin in user's inventory
export const findMostValuableSkin = (): InventoryItem | null => {
  const inventory = getUserInventory();
  if (inventory.length === 0) return null;
  
  return inventory.reduce((mostValuable, current) => {
    const currentValue = current.currentPrice || current.price || 0;
    const mostValuableValue = mostValuable.currentPrice || mostValuable.price || 0;
    return currentValue > mostValuableValue ? current : mostValuable;
  }, inventory[0]);
};
