
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/types/skin";
import { fetchTransactions } from "@/services/inventory";

/**
 * Hook for fetching transaction data
 */
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => fetchTransactions(),
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });
}

/**
 * Hook for fetching recent transactions
 */
export function useRecentTransactions(limit: number = 5) {
  const { data, isLoading, error } = useTransactions();
  
  const recentTransactions = data
    ? [...data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, limit)
    : [];
    
  return { 
    recentTransactions, 
    isLoading, 
    error 
  };
}

/**
 * Hook to get transaction stats
 */
export function useTransactionStats() {
  const { data: transactions = [], isLoading, error } = useTransactions();
  
  // Calculate stats
  const totalVolume = transactions.reduce((sum, transaction) => sum + transaction.price, 0);
  const purchaseVolume = transactions
    .filter(transaction => transaction.type === 'BUY')
    .reduce((sum, transaction) => sum + transaction.price, 0);
  const saleVolume = transactions
    .filter(transaction => transaction.type === 'SELL')
    .reduce((sum, transaction) => sum + transaction.price, 0);
  const profit = saleVolume - purchaseVolume;
  
  return {
    totalVolume,
    purchaseVolume,
    saleVolume,
    profit,
    transactionCount: transactions.length,
    isLoading,
    error
  };
}
