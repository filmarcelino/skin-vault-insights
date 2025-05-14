
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Skin, InventoryItem } from "@/types/skin";
import { SkinListItem } from "@/components/inventory/SkinListItem";
import { SkinCard } from "@/components/inventory/SkinCard";
import { ViewToggle } from "@/components/ui/view-toggle";

interface SearchResultsProps {
  isLoading?: boolean;
  paginatedSkins?: (Skin | InventoryItem)[];
  items?: (Skin | InventoryItem)[];  // Add this prop
  itemsPerPage?: number;
  searchQuery?: string;
  weaponFilter?: string;
  rarityFilter?: string;
  currentTab?: "inventory" | "allSkins";
  totalItems?: number;
  handleSkinClick?: (skin: Skin | InventoryItem) => void;
  skins?: Skin[] | InventoryItem[];
  onAddToInventory?: (item: any) => void;
  onViewDetails?: (item: InventoryItem) => void;
}

export const SearchResults = ({
  isLoading,
  paginatedSkins,
  items = [],  // Add default value
  itemsPerPage = 20,
  searchQuery = "",
  weaponFilter = "",
  rarityFilter = "",
  currentTab = "allSkins",
  totalItems = 0,
  handleSkinClick,
  skins = [],
  onAddToInventory,
  onViewDetails
}: SearchResultsProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Use either the paginatedSkins or items or skins prop
  const displayItems = paginatedSkins || items || skins;
  
  // Create a wrapper for skin click handling
  const handleItemClick = (skin: Skin | InventoryItem) => {
    if (handleSkinClick) {
      handleSkinClick(skin);
    } else if (onViewDetails && 'inventoryId' in skin) {
      onViewDetails(skin as InventoryItem);
    } else if (onAddToInventory) {
      onAddToInventory(skin);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {currentTab === "inventory" ? "Meu Inventário" : "Todas as Skins"}
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {totalItems || displayItems.length} {totalItems === 1 || displayItems.length === 1 ? "item" : "itens"} encontrados
          </div>
          <ViewToggle view={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {isLoading ? (
        /* ... keep existing code (loading state) */
        <div></div>
      ) : displayItems.length === 0 ? (
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
          {displayItems.map((skin) => {
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
                onClick={() => handleItemClick(skin)}
                className="animate-fade-in h-full"
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 rounded-md">
          {displayItems.map((skin) => {
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
                onClick={() => handleItemClick(skin)}
                className="animate-fade-in"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
