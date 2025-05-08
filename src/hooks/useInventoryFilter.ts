
import { useState, useEffect } from "react";
import { InventoryItem } from "@/types/skin";

export const useInventoryFilter = (inventory: InventoryItem[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [weaponFilter, setWeaponFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortMethod, setSortMethod] = useState("price_desc");
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);

  // Function to filter and sort the inventory
  const filterAndSortInventory = (
    items: InventoryItem[],
    search: string, 
    weapon: string, 
    rarity: string,
    sort: string
  ) => {
    // First filter
    let filtered = items.filter(item => {
      const matchesSearch = search.length < 3 || 
        item.name?.toLowerCase().includes(search.toLowerCase()) || 
        item.weapon?.toLowerCase().includes(search.toLowerCase());
      
      const matchesWeapon = weapon === "all" || item.weapon === weapon;
      const matchesRarity = rarity === "all" || item.rarity === rarity;
      
      return matchesSearch && matchesWeapon && matchesRarity;
    });

    // Then sort
    return filtered.sort((a, b) => {
      switch (sort) {
        case 'price_desc':
          return (b.currentPrice || b.price || 0) - (a.currentPrice || a.price || 0);
        case 'price_asc':
          return (a.currentPrice || a.price || 0) - (b.currentPrice || b.price || 0);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'date_desc':
          return new Date(b.acquiredDate).getTime() - new Date(a.acquiredDate).getTime();
        case 'date_asc':
          return new Date(a.acquiredDate).getTime() - new Date(b.acquiredDate).getTime();
        case 'profit_desc':
          const profitA = a.currentPrice && a.purchasePrice ? (a.currentPrice - a.purchasePrice) / a.purchasePrice * 100 : 0;
          const profitB = b.currentPrice && b.purchasePrice ? (b.currentPrice - b.purchasePrice) / b.purchasePrice * 100 : 0;
          return profitB - profitA;
        case 'profit_asc':
          const profitAsc1 = a.currentPrice && a.purchasePrice ? (a.currentPrice - a.purchasePrice) / a.purchasePrice * 100 : 0;
          const profitAsc2 = b.currentPrice && b.purchasePrice ? (b.currentPrice - b.purchasePrice) / b.purchasePrice * 100 : 0;
          return profitAsc1 - profitAsc2;
        default:
          return 0;
      }
    });
  };

  // Effect to update filtered inventory when filters change or inventory changes
  useEffect(() => {
    if (inventory.length > 0) {
      const filtered = filterAndSortInventory(
        inventory, 
        searchQuery, 
        weaponFilter, 
        rarityFilter, 
        sortMethod
      );
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory([]);
    }
  }, [inventory, searchQuery, weaponFilter, rarityFilter, sortMethod]);

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
    handleSearchChange
  };
};
