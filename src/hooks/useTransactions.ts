
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserTransactions } from "@/services/inventory/transactions-service";

export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: getUserTransactions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });
};

// Add a function to invalidate transactions cache
export const useInvalidateTransactions = () => {
  const queryClient = useQueryClient();
  
  return () => {
    console.log("Invalidating transactions cache");
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["sold-items"] });
  };
};
