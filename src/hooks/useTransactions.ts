
import { useQuery } from "@tanstack/react-query";
import { getUserTransactions } from "@/services/inventory/transactions-service";
import { TRANSACTIONS_QUERY_KEY } from "@/hooks/use-skins";

/**
 * Hook to fetch and manage user transaction data
 */
export const useTransactions = () => {
  return useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY],
    queryFn: async () => {
      try {
        const transactions = await getUserTransactions();
        return transactions;
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }
    },
    retry: 1,
  });
};
