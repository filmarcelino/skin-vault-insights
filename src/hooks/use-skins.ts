
import { useQuery } from "@tanstack/react-query";
import { 
  fetchSkins, 
  fetchSkinById, 
  fetchWeapons, 
  fetchCollections, 
  searchSkins 
} from "@/services/api";
import { Skin, SkinFilter, SkinCollection } from "@/types/skin";

export const useSkins = (filters?: SkinFilter) => {
  return useQuery({
    queryKey: ["skins", filters],
    queryFn: () => fetchSkins(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSkinById = (id: string) => {
  return useQuery({
    queryKey: ["skin", id],
    queryFn: () => fetchSkinById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
};

export const useWeapons = () => {
  return useQuery({
    queryKey: ["weapons"],
    queryFn: fetchWeapons,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSearchSkins = (query: string) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchSkins(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: query.length > 2, // Only search with at least 3 characters
  });
};

