
import { useQuery } from "@tanstack/react-query";
import { getUserTransactions } from "@/services/inventory/transactions-service";
import { Transaction } from "@/types/skin";

export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: getUserTransactions,
  });
};
