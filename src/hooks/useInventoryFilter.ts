
import { useState, useMemo, useCallback } from "react";
import { InventoryItem } from "@/types/skin";

export type InventoryFilter = {
  id: string;
  label: string;
  value: string;
};

export const useInventoryFilter = (inventory: InventoryItem[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [weaponFilter, setWeaponFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortMethod, setSortMethod] = useState("price_desc");

  // Update filter function to match the signature used in InventoryFilterBar
  const updateFilter = useCallback((filterId: string, value: string) => {
    switch (filterId) {
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

  const filteredInventory = useMemo(() => {
    if (!inventory || inventory.length === 0) {
      return [];
    }

    // Filter items
    let filtered = inventory.filter(item => {
      // Search filter
      if (searchQuery && !item.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !item.weapon?.toLowerCase().includes(searchQuery.toLowerCase())) {
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
    });

    // Sort items
    filtered = [...filtered].sort((a, b) => {
      switch (sortMethod) {
        case "price_desc":
          return (b.price || 0) - (a.price || 0);
        case "price_asc":
          return (a.price || 0) - (b.price || 0);
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "");
        case "date_desc":
          return new Date(b.acquiredDate || 0).getTime() - new Date(a.acquiredDate || 0).getTime();
        case "date_asc":
          return new Date(a.acquiredDate || 0).getTime() - new Date(b.acquiredDate || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [inventory, searchQuery, weaponFilter, rarityFilter, sortMethod]);

  return {
    searchQuery,
    setSearchQuery,
    weaponFilter,
    setWeaponFilter,
    rarityFilter,
    setRarityFilter,
    sortMethod,
    setSortMethod,
    filteredInventory,
    updateFilter,
    filterItems: (items: InventoryItem[]) => {
      if (!items || items.length === 0) {
        return [];
      }
  
      // Filter items
      let filtered = items.filter(item => {
        // Search filter
        if (searchQuery && !item.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !item.weapon?.toLowerCase().includes(searchQuery.toLowerCase())) {
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
      });
  
      // Sort items
      filtered = [...filtered].sort((a, b) => {
        switch (sortMethod) {
          case "price_desc":
            return (b.price || 0) - (a.price || 0);
          case "price_asc":
            return (a.price || 0) - (b.price || 0);
          case "name_asc":
            return (a.name || "").localeCompare(b.name || "");
          case "name_desc":
            return (b.name || "").localeCompare(a.name || "");
          case "date_desc":
            return new Date(b.acquiredDate || 0).getTime() - new Date(a.acquiredDate || 0).getTime();
          case "date_asc":
            return new Date(a.acquiredDate || 0).getTime() - new Date(b.acquiredDate || 0).getTime();
          default:
            return 0;
        }
      });
  
      return filtered;
    }
  };
};
