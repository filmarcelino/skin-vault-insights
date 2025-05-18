
import { getUserInventory } from "@/services/inventory";
import { getUserTransactions } from "@/services/inventory/transactions-service";
import { InventoryItem, Transaction } from "@/types/skin";
import { calculateInventoryValue, calculateProfitLoss } from "@/utils/financial-utils";
import { supabase } from "@/integrations/supabase/client";

export type ExportDataType = 'inventory' | 'transactions' | 'financial' | 'all';

export interface ExportOptions {
  format: 'json' | 'csv';
  type: ExportDataType;
  includeDetails: boolean;
}

export interface ExportSummary {
  totalItems: number;
  activeSkins: number;
  totalValue: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  transactionCount: number;
  exportDate: string;
}

/**
 * Prepares and returns data for export based on specified options
 */
export const prepareExportData = async (options: ExportOptions): Promise<{ data: any, summary: ExportSummary }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
  // Check if user is admin to determine if they can access all data or just their own
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .maybeSingle();
  
  const isAdmin = userProfile?.is_admin || false;
  
  let inventory: InventoryItem[] = [];
  let transactions: Transaction[] = [];
  
  if (isAdmin) {
    // Admins can export data for all users or specific users
    console.log("Admin user detected - can export all user data");
    // For now, we'll continue to use the regular function (user's own data)
    // In a real implementation, you'd add parameters to specify which user's data to export
    inventory = await getUserInventory();
    transactions = await getUserTransactions();
  } else {
    // Regular users can only export their own data
    console.log("Regular user - exporting only their own data");
    inventory = await getUserInventory();
    transactions = await getUserTransactions();
  }
  
  // Filter active inventory items
  const activeItems = inventory.filter(item => item.isInUserInventory);
  
  // Calculate summary data
  const totalValue = calculateInventoryValue(activeItems);
  const { profit, loss } = calculateProfitLoss(transactions);
  
  const summary: ExportSummary = {
    totalItems: inventory.length,
    activeSkins: activeItems.length,
    totalValue,
    totalProfit: profit,
    totalLoss: loss,
    netProfit: profit - loss,
    transactionCount: transactions.length,
    exportDate: new Date().toISOString()
  };

  // Prepare the export data based on selected type
  let exportData: any;
  
  switch (options.type) {
    case 'inventory':
      exportData = activeItems;
      break;
    case 'transactions':
      exportData = transactions;
      break;
    case 'financial':
      exportData = {
        summary,
        transactions: transactions.filter(t => t.type === 'sell' || t.type === 'add')
      };
      break;
    case 'all':
    default:
      exportData = {
        inventory: activeItems,
        transactions,
        summary
      };
  }

  return { data: exportData, summary };
};

/**
 * Admin function to export data for a specific user or all users
 */
export const prepareAdminExportData = async (
  options: ExportOptions, 
  targetUserId?: string
): Promise<{ data: any, summary: ExportSummary }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
  // Verify admin status
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();
  
  if (!userProfile?.is_admin) {
    throw new Error("Only administrators can use this function");
  }
  
  // Get inventory and transactions for the specified user or all users
  let inventoryQuery = supabase.from('inventory').select('*');
  let transactionsQuery = supabase.from('transactions').select('*');
  
  if (targetUserId) {
    // Export data for specific user
    inventoryQuery = inventoryQuery.eq('user_id', targetUserId);
    transactionsQuery = transactionsQuery.eq('user_id', targetUserId);
  }
  
  const [inventoryResult, transactionsResult] = await Promise.all([
    inventoryQuery.order('created_at', { ascending: false }),
    transactionsQuery.order('date', { ascending: false })
  ]);
  
  if (inventoryResult.error) throw new Error(`Error fetching inventory: ${inventoryResult.error.message}`);
  if (transactionsResult.error) throw new Error(`Error fetching transactions: ${transactionsResult.error.message}`);
  
  // Map data to appropriate types
  const inventory = inventoryResult.data.map(item => mapSupabaseToInventoryItem(item)).filter(Boolean) as InventoryItem[];
  const transactions = transactionsResult.data.map(item => mapSupabaseToTransaction(item)).filter(Boolean) as Transaction[];
  
  // Continue with the same logic as prepareExportData
  const activeItems = inventory.filter(item => item.isInUserInventory);
  const totalValue = calculateInventoryValue(activeItems);
  const { profit, loss } = calculateProfitLoss(transactions);
  
  const summary: ExportSummary = {
    totalItems: inventory.length,
    activeSkins: activeItems.length,
    totalValue,
    totalProfit: profit,
    totalLoss: loss,
    netProfit: profit - loss,
    transactionCount: transactions.length,
    exportDate: new Date().toISOString()
  };
  
  // Prepare export data
  let exportData: any;
  
  switch (options.type) {
    case 'inventory':
      exportData = activeItems;
      break;
    case 'transactions':
      exportData = transactions;
      break;
    case 'financial':
      exportData = {
        summary,
        transactions: transactions.filter(t => t.type === 'sell' || t.type === 'add')
      };
      break;
    case 'all':
    default:
      exportData = {
        inventory: activeItems,
        transactions,
        summary
      };
  }

  return { data: exportData, summary };
};

// Import needed functions for admin export
import { mapSupabaseToInventoryItem } from "./inventory/inventory-mapper";
import { mapSupabaseToTransaction } from "./inventory/inventory-mapper";

/**
 * Converts data to CSV format
 */
export const convertToCSV = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '';
      }
      // Handle strings (especially those with commas)
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      // Handle nested objects/arrays by stringifying
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

/**
 * Downloads data as a file
 */
export const downloadData = (
  data: any,
  format: 'json' | 'csv',
  filename: string = 'export'
): void => {
  const date = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}-${date}.${format}`;
  
  let content: string;
  let type: string;
  
  if (format === 'csv') {
    // If data is not an array but has properties that are arrays, use the first array found
    if (!Array.isArray(data)) {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          data = data[key];
          break;
        }
      }
    }
    content = convertToCSV(Array.isArray(data) ? data : [data]);
    type = 'text/csv';
  } else {
    content = JSON.stringify(data, null, 2);
    type = 'application/json';
  }
  
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fullFilename;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
};
