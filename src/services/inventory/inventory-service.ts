
import { getUserInventory } from "./inventory-functions";
import { getUserTransactions } from "./transactions-service";
import { InventoryItem, Transaction } from "@/types/skin";
import { calculateInventoryValue, calculateProfitLoss } from "@/utils/financial-utils";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToInventoryItem, mapSupabaseToTransaction } from "./inventory-mapper";

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

// Export functions from inventory-functions
export { addSkinToInventory } from "./inventory-functions";
export { removeSkinFromInventory } from "./inventory-functions";
export { updateInventoryItem } from "./inventory-functions";
export { sellSkin } from "./inventory-functions";
