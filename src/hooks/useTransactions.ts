
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserTransactions } from "@/services/inventory/transactions-service";

export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: getUserTransactions,
  });
};

// Add a function to invalidate transactions cache
export const useInvalidateTransactions = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };
};
