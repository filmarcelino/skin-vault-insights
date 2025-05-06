
import React from "react";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { InventoryListItem } from "@/components/dashboard/inventory-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { InventoryFilterBar } from "@/components/dashboard/InventoryFilterBar";
import { InventoryItem } from "@/types/skin";

interface InventorySectionProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  weaponFilter: string;
  setWeaponFilter: (value: string) => void;
  rarityFilter: string;
  setRarityFilter: (value: string) => void;
  sortMethod: string;
  setSortMethod: (value: string) => void;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  filteredInventory: InventoryItem[];
  userInventory: InventoryItem[];
  inventoryStats: {
    totalValue: string;
  };
  handleSkinClick: (skin: InventoryItem) => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
  searchQuery,
  onSearchChange,
  weaponFilter,
  setWeaponFilter,
  rarityFilter,
  setRarityFilter,
  sortMethod,
  setSortMethod,
  viewMode,
  isLoading,
  filteredInventory,
  userInventory,
  inventoryStats,
  handleSkinClick,
}) => {
  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h2 className="text-xl font-bold mb-4 md:mb-0">My Inventory</h2>
        
        <div className="w-full md:w-auto">
          <InventoryFilterBar 
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            weaponFilter={weaponFilter}
            onWeaponFilterChange={setWeaponFilter}
            rarityFilter={rarityFilter}
            onRarityFilterChange={setRarityFilter}
            sortMethod={sortMethod}
            onSortMethodChange={setSortMethod}
          />
        </div>
      </div>

      {userInventory.length > 0 && (
        <InsightsCard 
          message={`Your inventory has ${userInventory.length} skins worth ${inventoryStats.totalValue}`}
          className="mb-6 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
          id="inventory-summary"
        />
      )}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="cs-card p-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="flex justify-between mt-1">
                  <div className="h-2.5 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-2.5 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))
          ) : filteredInventory.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <p>Your inventory is empty.</p>
              <p className="mt-2">Switch to "Search Skins" tab to find and add skins to your inventory.</p>
            </div>
          ) : (
            filteredInventory.map((skin, index) => (
              <InventoryCard 
                key={skin.inventoryId}
                weaponName={skin.weapon || "Unknown"}
                skinName={skin.name}
                wear={skin.wear || skin.rarity || "Unknown"}
                price={skin.currentPrice?.toString() || skin.price?.toString() || "N/A"}
                image={skin.image}
                rarity={skin.rarity}
                isStatTrak={skin.isStatTrak}
                tradeLockDays={skin.tradeLockDays}
                tradeLockUntil={skin.tradeLockUntil}
                className="animate-fade-in transition-transform duration-200"
                style={{ animationDelay: `${0.5 + (index * 0.05)}s` }}
                onClick={() => handleSkinClick(skin)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 border rounded-md divide-y divide-border/50">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, idx) => (
              <div key={`skeleton-list-${idx}`} className="p-3 flex items-center gap-3">
                <Skeleton className="h-12 w-12 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12 shrink-0" />
              </div>
            ))
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Your inventory is empty.</p>
              <p className="mt-2">Switch to "Search Skins" tab to find and add skins to your inventory.</p>
            </div>
          ) : (
            filteredInventory.map((skin, index) => (
              <InventoryListItem 
                key={skin.inventoryId}
                weaponName={skin.weapon || "Unknown"}
                skinName={skin.name}
                wear={skin.wear || skin.rarity || "Unknown"}
                price={skin.currentPrice?.toString() || skin.price?.toString() || "N/A"}
                image={skin.image}
                rarity={skin.rarity}
                isStatTrak={skin.isStatTrak}
                tradeLockDays={skin.tradeLockDays}
                tradeLockUntil={skin.tradeLockUntil}
                className="animate-fade-in"
                style={{ animationDelay: `${0.5 + (index * 0.05)}s` }}
                onClick={() => handleSkinClick(skin)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
