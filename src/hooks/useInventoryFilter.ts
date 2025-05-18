
import { useState, useEffect } from "react";
import { InventoryItem } from "@/types/skin";

// Define a filter object type
export type InventoryFilter = {
  id: string;
  label: string;
  value: string;
};

export const useInventoryFilter = (initialInventory: InventoryItem[] = []) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [weaponFilter, setWeaponFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortMethod, setSortMethod] = useState("price_desc");
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  
  // Define the inventoryFilters array that the Inventory component expects
  const inventoryFilters: InventoryFilter[] = [
    { id: "search", label: "Search", value: searchQuery },
    { id: "weapon", label: "Weapon", value: weaponFilter },
    { id: "rarity", label: "Rarity", value: rarityFilter },
    { id: "sort", label: "Sort", value: sortMethod }
  ];

  // Function to update a specific filter
  const updateFilter = (filterId: string, value: string) => {
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
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setWeaponFilter("all");
    setRarityFilter("all");
    setSortMethod("price_desc");
  };

  // Function to filter and sort the inventory
  const filterInventoryItems = (items: InventoryItem[]) => {
    // Ensure we have items before filtering
    if (!items || items.length === 0) {
      return [];
    }
    
    // First filter
    let filtered = items.filter(item => {
      const matchesSearch = searchQuery.length < 3 || 
        (item.name?.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (item.weapon?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesWeapon = weaponFilter === "all" || item.weapon === weaponFilter;
      const matchesRarity = rarityFilter === "all" || item.rarity === rarityFilter;
      
      return matchesSearch && matchesWeapon && matchesRarity;
    });

    // Then sort
    return filtered.sort((a, b) => {
      switch (sortMethod) {
        case 'price_desc':
          return (b.currentPrice || b.price || 0) - (a.currentPrice || a.price || 0);
        case 'price_asc':
          return (a.currentPrice || a.price || 0) - (b.currentPrice || b.price || 0);
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'date_desc':
          return new Date(b.acquiredDate || 0).getTime() - new Date(a.acquiredDate || 0).getTime();
        case 'date_asc':
          return new Date(a.acquiredDate || 0).getTime() - new Date(b.acquiredDate || 0).getTime();
        case 'profit_desc':
          const profitA = a.currentPrice && a.purchasePrice ? (a.currentPrice - a.purchasePrice) / a.purchasePrice * 100 : 0;
          const profitB = b.currentPrice && b.purchasePrice ? (b.currentPrice - b.purchasePrice) / b.purchasePrice * 100 : 0;
          return profitB - profitA;
        case 'profit_asc':
          const profitAsc1 = a.currentPrice && a.purchasePrice ? (a.currentPrice - a.purchasePrice) / a.purchasePrice * 100 : 0;
          const profitAsc2 = b.currentPrice && b.purchasePrice ? (b.currentPrice - b.purchasePrice) / b.currentPrice * 100 : 0;
          return profitAsc1 - profitAsc2;
        default:
          return 0;
      }
    });
  };

  // Effect to update filtered inventory when filters change or inventory changes
  useEffect(() => {
    if (initialInventory && initialInventory.length > 0) {
      const filtered = filterInventoryItems(initialInventory);
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory([]);
    }
  }, [initialInventory, searchQuery, weaponFilter, rarityFilter, sortMethod]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
    handleSearchChange,
    // Add these properties to match what's expected in Inventory.tsx
    inventoryFilters,
    filterInventoryItems,
    clearFilters,
    updateFilter
  };
};
