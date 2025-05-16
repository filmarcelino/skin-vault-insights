
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSkins } from "@/services/api";
import { fetchUserInventory } from "@/services/inventory";

// Hook to fetch all CS2 skins from the API
export const useSkins = (params?: { weaponType?: string; search?: string }) => {
  return useQuery({
    queryKey: ["skins", params?.weaponType || "all", params?.search || ""],
    queryFn: () => fetchSkins(params?.weaponType, params?.search),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Hook to fetch user inventory data
export const useUserInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      return await fetchUserInventory();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to invalidate inventory cache
export const useInvalidateInventory = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["inventory"] });
};

// Used for analytics graphs
export const useSkinPriceHistory = (skinId: string) => {
  return useQuery({
    queryKey: ["skinPriceHistory", skinId],
    queryFn: async () => {
      // Mock price history data for now
      const daysAgo = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split("T")[0];
      };
      
      return [
        { date: daysAgo(30), price: 100 },
        { date: daysAgo(25), price: 105 },
        { date: daysAgo(20), price: 102 },
        { date: daysAgo(15), price: 110 },
        { date: daysAgo(10), price: 115 },
        { date: daysAgo(5), price: 112 },
        { date: daysAgo(0), price: 118 },
      ];
    },
    enabled: !!skinId,
  });
};
