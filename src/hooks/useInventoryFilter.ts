
import { useState, useCallback } from "react";
import { InventoryItem } from "@/types/skin";

export interface InventoryFilter {
  id: string;
  label: string;
  value: string;
}

export const useInventoryFilter = (initialItems: InventoryItem[] = []) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [weaponFilter, setWeaponFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortMethod, setSortMethod] = useState("price_desc");

  // Add handler for search input changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Add handler for general filter updates
  const updateFilter = useCallback((filterId: string, value: string) => {
    switch(filterId) {
      case "search":
        setSearchQuery(value);
        break;
      case "weapon":
        setWeaponFilter(value);
        break;
      case "rarity":
        setRarityFilter(value);
        break;
      case "sort":
        setSortMethod(value);
        break;
    }
  }, []);

  // Filter items based on current filters
  const filterItems = useCallback((items: InventoryItem[]) => {
    return items.filter(item => {
      // Search filter
      if (searchQuery && !(
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.weapon?.toLowerCase().includes(searchQuery.toLowerCase())
      )) {
        return false;
      }
      
      // Weapon filter
      if (weaponFilter !== "all" && item.weapon !== weaponFilter) {
        return false;
      }
      
      // Rarity filter
      if (rarityFilter !== "all" && item.rarity !== rarityFilter) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      switch (sortMethod) {
        case "price_asc":
          return (a.currentPrice || a.price || 0) - (b.currentPrice || b.price || 0);
        case "price_desc":
          return (b.currentPrice || b.price || 0) - (a.currentPrice || a.price || 0);
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "");
        case "date_asc":
          return new Date(a.acquiredDate).getTime() - new Date(b.acquiredDate).getTime();
        case "date_desc":
          return new Date(b.acquiredDate).getTime() - new Date(a.acquiredDate).getTime();
        default:
          return 0;
      }
    });
  }, [searchQuery, weaponFilter, rarityFilter, sortMethod]);

  return {
    searchQuery,
    setSearchQuery,
    weaponFilter,
    setWeaponFilter,
    rarityFilter,
    setRarityFilter,
    sortMethod,
    setSortMethod,
    handleSearchChange,
    updateFilter,
    filterItems,
  };
};
