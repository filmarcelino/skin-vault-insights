
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Skin, InventoryItem } from "@/types/skin";
import { SkinListItem } from "@/components/inventory/SkinListItem";
import { SkinCard } from "@/components/inventory/SkinCard";
import { ViewToggle } from "@/components/ui/view-toggle";

interface SearchResultsProps {
  isLoading: boolean;
  paginatedSkins: (Skin | InventoryItem)[];
  itemsPerPage: number;
  searchQuery: string;
  weaponFilter: string;
  rarityFilter: string;
  currentTab: "inventory" | "allSkins";
  totalItems: number;
  handleSkinClick: (skin: Skin | InventoryItem) => void;
}

export const SearchResults = ({
  isLoading,
  paginatedSkins,
  itemsPerPage,
  searchQuery,
  weaponFilter,
  rarityFilter,
  currentTab,
  totalItems,
  handleSkinClick
}: SearchResultsProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {currentTab === "inventory" ? "Meu Inventário" : "Todas as Skins"}
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {totalItems} {totalItems === 1 ? "item" : "itens"} encontrados
          </div>
          <ViewToggle view={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div key={`skeleton-grid-${idx}`} className="p-3 flex flex-col gap-2">
                <Skeleton className="h-20 w-full shrink-0" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 rounded-md">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div key={`skeleton-list-${idx}`} className="p-3 flex items-center gap-3">
                <Skeleton className="h-12 w-12 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12 shrink-0" />
              </div>
            ))}
          </div>
        )
      ) : paginatedSkins.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery.length > 0 || weaponFilter || rarityFilter ? (
            <>Nenhuma skin encontrada com esses critérios. Tente ajustar seus filtros.</>
          ) : currentTab === "inventory" ? (
            <>Seu inventário está vazio.</>
          ) : (
            <>Nenhuma skin disponível.</>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {paginatedSkins.map((skin) => {
            // Convert Skin to InventoryItem if needed
            const itemToUse: InventoryItem = 'inventoryId' in skin 
              ? skin as InventoryItem 
              : {
                  ...skin,
                  inventoryId: `demo-${skin.id}`,
                  acquiredDate: new Date().toISOString(),
                  purchasePrice: skin.price || 0,
                  currentPrice: skin.price,
                  tradeLockDays: 0,
                  isStatTrak: false,
                  isInUserInventory: false
                };
            
            return (
              <SkinCard 
                key={itemToUse.inventoryId}
                item={itemToUse}
                showMetadata={true}
                onClick={() => handleSkinClick(skin)}
                className="animate-fade-in h-full"
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 rounded-md">
          {paginatedSkins.map((skin) => {
            // Convert Skin to InventoryItem if needed
            const itemToUse: InventoryItem = 'inventoryId' in skin 
              ? skin as InventoryItem 
              : {
                  ...skin,
                  inventoryId: `demo-${skin.id}`,
                  acquiredDate: new Date().toISOString(),
                  purchasePrice: skin.price || 0,
                  currentPrice: skin.price,
                  tradeLockDays: 0,
                  isStatTrak: false,
                  isInUserInventory: false
                };
            
            return (
              <SkinListItem 
                key={itemToUse.inventoryId}
                item={itemToUse}
                showMetadata={true}
                onClick={() => handleSkinClick(skin)}
                className="animate-fade-in"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
