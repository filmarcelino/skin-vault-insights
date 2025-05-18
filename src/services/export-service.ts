
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
  
  // Get inventory items and transactions
  const inventory = await getUserInventory();
  const transactions = await getUserTransactions();
  
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
